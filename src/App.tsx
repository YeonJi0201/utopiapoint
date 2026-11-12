/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TabType, HouseId, PointRecord } from './types';
import { Header } from './components/Header';
import { HouseBannersView } from './components/HouseBannersView';
import { HouseDetailView } from './components/HouseDetailView';
import { RankingView } from './components/RankingView';
import { ScoringGuideView } from './components/ScoringGuideView';
import { AdminPage } from './components/AdminPage';
import * as backend from './lib/backend';
import { CUP_END_DATE } from './data/houseData';
import { magicAudio } from './utils/audio';
import { Volume2, VolumeX } from 'lucide-react';

/** the staff room lives at /admin and nowhere else */
const isAdminRoute = () =>
  typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '').toLowerCase() === '/admin';

export default function App() {
  const adminRoute = isAdminRoute();
  const [records, setRecords] = useState<PointRecord[]>([]);
  const [currentTab, setCurrentTab] = useState<TabType>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    return (['overview', 'details', 'ranking', 'guide'] as TabType[]).includes(hash as TabType) ? (hash as TabType) : 'overview';
  });

  // keep the address in step with the tab so a page can be linked directly
  useEffect(() => {
    if (adminRoute) return;
    const next = currentTab === 'overview' ? window.location.pathname : `#${currentTab}`;
    window.history.replaceState(null, '', next);
  }, [currentTab, adminRoute]);
  const [detailHouseFilter, setDetailHouseFilter] = useState<HouseId | 'all'>('all');
  const [detailSearch, setDetailSearch] = useState('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // ---- data: from Supabase (or this browser, before the database is set up) ----
  const [cupEnd, setCupEnd] = useState(CUP_END_DATE);
  const [loadError, setLoadError] = useState('');

  const reloadRecords = useCallback(() => {
    backend
      .loadRecords()
      .then((r) => {
        setRecords(r);
        setLoadError('');
      })
      .catch((e: Error) => setLoadError(e.message));
  }, []);
  const reloadCupEnd = useCallback(() => {
    backend.loadCupEnd().then(setCupEnd).catch((e: Error) => setLoadError(e.message));
  }, []);

  useEffect(() => {
    reloadRecords();
    reloadCupEnd();
    // an admin's change anywhere shows up here without a refresh
    return backend.subscribe({ records: reloadRecords, cupEnd: reloadCupEnd });
  }, [reloadRecords, reloadCupEnd]);

  // admin actions: write first, then show what the database now holds
  const handleAddRecord = async (rec: backend.NewRecord) => {
    const created = await backend.addRecord(rec);
    setRecords((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
  };
  const handleUpdateRecord = async (id: string, patch: Partial<PointRecord>) => {
    const updated = await backend.updateRecord(id, patch);
    setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };
  const handleDeleteRecord = async (id: string) => {
    await backend.deleteRecord(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };
  const handleImportRecords = async (imported: PointRecord[]) => {
    await backend.replaceRecords(imported);
    setRecords(await backend.loadRecords());
  };
  const handleResetRecords = async () => {
    await backend.resetRecords();
    setRecords(await backend.loadRecords());
  };
  const handleSaveCupEnd = async (iso: string) => {
    await backend.saveCupEnd(iso);
    setCupEnd(iso);
  };

  // Direct jump from Main Screen to House Details
  const handleSelectHouseDetail = (houseId: HouseId) => {
    setDetailHouseFilter(houseId);
    setDetailSearch('');
    setCurrentTab('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle sound effects
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    magicAudio.enabled = next;
    if (next) {
      magicAudio.playGemClink();
    }
  };

  if (adminRoute) {
    return (
      <AdminPage
        records={records}
        cupEnd={cupEnd}
        loadError={loadError}
        onAddRecord={handleAddRecord}
        onUpdateRecord={handleUpdateRecord}
        onDeleteRecord={handleDeleteRecord}
        onImportRecords={handleImportRecords}
        onResetRecords={handleResetRecords}
        onSaveCupEnd={handleSaveCupEnd}
      />
    );
  }

  return (
    <div className="hall-app min-h-screen bg-[#0b0c10] text-neutral-100 flex flex-col font-sans selection:bg-amber-900/60 selection:text-amber-200">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'details') {
            setDetailHouseFilter('all');
            setDetailSearch('');
          }
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        soundEnabled={soundEnabled}
        overlay={currentTab === 'overview'}
      />

      {/* Main Content Area */}
      <main className="ov-main relative z-10 flex-1 w-full">
        {currentTab === 'overview' && (
          <HouseBannersView
            records={records}
            cupEnd={cupEnd}
            onSelectHouseDetail={handleSelectHouseDetail}
            onOpenGuide={() => {
              setCurrentTab('guide');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenStats={() => {
              setCurrentTab('ranking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'details' && (
          <HouseDetailView
            records={records}
            initialHouseId={detailHouseFilter}
            initialSearch={detailSearch}
          />
        )}

        {currentTab === 'ranking' && (
          <RankingView
            records={records}
            onSelectCharacterFilter={(charName) => {
              setDetailHouseFilter('all');
              setDetailSearch(charName);
              setCurrentTab('details');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'guide' && <ScoringGuideView />}
      </main>

      {/* Footer */}
      <footer id="site-footer" className="hall-footer relative z-10 border-t border-neutral-900 bg-neutral-950/80 py-8 text-center text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-cinzel text-neutral-400 tracking-wider">
            &ldquo;DRACO DORMIENS NUNQUAM TITILLANDUS&rdquo;
          </div>
          <div className="text-[11px] text-neutral-400">
            호그와트 마법학교 자캐 커뮤니티 전용 기숙사 우승컵 보드
          </div>
          <button
            type="button"
            onClick={handleToggleSound}
            aria-pressed={soundEnabled}
            className="hall-sound-toggle inline-flex items-center gap-1.5 text-[11px]"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" aria-hidden="true" /> : <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />}
            {soundEnabled ? '효과음 켜짐' : '효과음 꺼짐'}
          </button>
        </div>
      </footer>
    </div>
  );
}
