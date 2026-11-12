/**
 * Depth-map parallax for the Great Hall plate.
 *
 * One image, one depth map. A camera that slides and pushes in: each surface
 * moves and grows by its own depth, so nearer things come toward the viewer
 * more than farther ones. Where a near object slides away, the hall behind
 * it comes from a second plate with those objects painted out.
 *
 * Data texture: R = depth (0 = the hall, which never moves; 1 = nearest),
 *               G = floating-candle id (bobs on its own rhythm), B = coverage alpha.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * .5 + .5, .5 - aPos.y * .5);
  gl_Position = vec4(aPos, 0., 1.);
}`;

const FLAME_COUNT = 22;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#define FLAMES ${FLAME_COUNT}
uniform sampler2D uImage;
uniform sampler2D uReveal;
uniform sampler2D uData;
uniform vec2 uSize;
uniform vec2 uShift;
uniform float uDolly;   // camera push: a surface at depth d grows by (1 + uDolly * d) about the centre
uniform float uTime;
uniform vec4 uFlame[FLAMES];   // x, y, radius (px), depth
uniform float uFlameId[FLAMES];
varying vec2 vUv;

float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float noise(float x) { float i = floor(x), f = fract(x); return mix(hash(i), hash(i + 1.), f * f * (3. - 2. * f)); }

vec2 bob(float id) {
  if (id < .5) return vec2(0.);
  float h = hash(id);
  float sp = .55 + .5 * hash(id + 7.);
  return vec2(.7 * sin(uTime * sp * .7 + h * 4.),
              (2. + 2.5 * h) * sin(uTime * sp + h * 6.2831));
}

// Front-to-back search: walk the depth layers from nearest to farthest and take
// the first surface that, displaced by its own depth, lands on this pixel.
// Thin things (candles) can't be skipped this way, and edges composite with
// their alpha over whatever is truly behind them.
#define STEPS 28
#define NEAR 1.0
#define FAR .38

void main() {
  vec2 q = vUv;
  vec2 C = vec2(.5);
  vec4 here = texture2D(uData, q);
  // what is behind any moving thing at this pixel: the hall itself
  vec3 behind = here.r < .02 ? texture2D(uImage, q).rgb : texture2D(uReveal, q).rgb;
  vec3 col = behind;

  float stepSize = (NEAR - FAR) / float(STEPS);
  for (int i = 0; i <= STEPS; i++) {
    float s = NEAR - float(i) * stepSize;
    // invert the camera move for a surface at depth s: push (scale about the centre) + slide
    vec2 p = C + (q - C - uShift * s / uSize) / (1. + uDolly * s);
    vec3 m = texture2D(uData, p).rgb;
    float id = floor(m.g * 255. + .5);
    if (id > .5) {                       // floating candle: also ride its own bob
      p -= bob(id) / uSize;
      m = texture2D(uData, p).rgb;
    }
    if (m.r > .02 && abs(m.r - s) <= stepSize * .75) {
      vec3 obj = texture2D(uImage, p).rgb;
      col = mix(behind, obj, clamp(m.b * 1.04, 0., 1.));
      break;
    }
  }

  // candle light rides with its candle and breathes
  vec2 px = q * uSize;
  for (int i = 0; i < FLAMES; i++) {
    vec4 f = uFlame[i];
    float g = 1. + uDolly * f.w;
    vec2 c = uSize * .5 + (f.xy + bob(uFlameId[i]) - uSize * .5) * g + uShift * f.w;
    vec2 d = px - c;
    float r = f.z * g;
    float fl = noise(uTime * 7.3 + float(i) * 3.1) * .6 + noise(uTime * 2.1 + float(i) * 9.7) * .4;
    float halo = exp(-dot(d, d) / (r * r * 2.2));
    float core = exp(-dot(d, d) / (r * r * .18));
    col += vec3(1., .72, .4) * (halo * (.07 + .12 * fl) + core * (.05 + .07 * fl));
  }
  gl_FragColor = vec4(col, 1.);
}`;

/* x, y, glow radius, depth of the candle under the flame, floating-candle id */
const FLAMES: [number, number, number, number, number][] = [
  [597, 79, 17.6, 0.562, 1], [608, 267, 19.7, 0.594, 2], [664, 266, 20.1, 0.599, 3],
  [580, 292, 19, 0.583, 4], [910, 109, 23.5, 0.65, 5], [1107, 163, 18.6, 0.578, 6],
  [1122, 212, 21.2, 0.615, 7], [1174, 206, 19.2, 0.586, 8], [1182, 147, 19.7, 0.594, 9],
  [1143, 84, 17.2, 0.557, 10], [1262, 83, 16.8, 0.551, 11], [1037, 303, 18.6, 0.578, 12],
  [1070, 302, 20.1, 0.599, 13], [935, 332, 19.4, 0.589, 14], [1648, 118, 24, 0.845, 15],
  [42, 318, 22, 0.691, 0], [182, 352, 13, 0, 0], [223, 428, 15, 0, 0],
  [1477, 673, 19, 0.498, 0], [1523, 642, 21, 0.459, 0], [1574, 612, 23, 0.42, 0], [1642, 636, 19, 0.451, 0],
];

export const PLATE_W = 1672;
export const PLATE_H = 941;

export interface DepthRenderer {
  resize(width: number, height: number): void;
  /** shift in plate px for depth 1; dolly = extra scale for depth 1 (keep >= 0) */
  render(shiftX: number, shiftY: number, dolly: number, time: number): void;
  dispose(): void;
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export async function createDepthRenderer(
  canvas: HTMLCanvasElement,
  sources: { image: string; reveal: string; data: string },
): Promise<DepthRenderer | null> {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
  if (!gl) return null;

  const [image, reveal, data] = await Promise.all([loadImage(sources.image), loadImage(sources.reveal), loadImage(sources.data)]);

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link');
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  const textures: WebGLTexture[] = [];
  const upload = (unit: number, img: HTMLImageElement, filter: number, name: string) => {
    const t = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.uniform1i(gl.getUniformLocation(prog, name), unit);
    textures.push(t);
  };
  upload(0, image, gl.LINEAR, 'uImage');
  upload(1, reveal, gl.LINEAR, 'uReveal');
  upload(2, data, gl.NEAREST, 'uData');

  gl.uniform2f(gl.getUniformLocation(prog, 'uSize'), PLATE_W, PLATE_H);
  gl.uniform4fv(gl.getUniformLocation(prog, 'uFlame'), new Float32Array(FLAMES.flatMap(([x, y, r, d]) => [x, y, r, d])));
  gl.uniform1fv(gl.getUniformLocation(prog, 'uFlameId'), new Float32Array(FLAMES.map((f) => f[4])));
  const uShift = gl.getUniformLocation(prog, 'uShift');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uDolly = gl.getUniformLocation(prog, 'uDolly');

  let disposed = false;
  return {
    resize(width, height) {
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    },
    render(shiftX, shiftY, dolly, time) {
      if (disposed) return;
      gl.uniform2f(uShift, shiftX, shiftY);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uDolly, dolly);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      disposed = true;
      textures.forEach((t) => gl.deleteTexture(t));
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
