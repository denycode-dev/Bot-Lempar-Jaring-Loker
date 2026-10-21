'use client';

import React, { useState, useEffect } from 'react';
import { AppliedJobsView } from '@/components/history/AppliedJobsView';
import { JobDetailDialog } from '@/components/modals/JobDetailDialog';
import { AppliedJobCard } from '@/components/JobCard';
import { toast } from 'sonner';

export default function ApplicationsPage() {
  const [jobs, setJobs] = useState<AppliedJobCard[]>([]);
  const [selectedJob, setSelectedJob] = useState<AppliedJobCard | null>(null);
  const [storageInfo, setStorageInfo] = useState<string>('PostgreSQL');

  const fetchJobs = React.useCallback(async () => {
    try {
      const res = await fetch('/api/applied?refresh=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setJobs(data.data);
        if (data.storageInfo) setStorageInfo(data.storageInfo);
      }
    } catch (err: any) {
      toast.error('Gagal memuat riwayat lamaran: ' + err.message);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const handleExportCsv = () => {
    window.open('/api/applied?export=csv', '_blank');
  };

  return (
    <div className="space-y-6">
      <AppliedJobsView
        jobs={jobs}
        storageType="sqlite" // maps to local DB styling
        activeStorageInfo={storageInfo}
        onRefresh={fetchJobs}
        onExportCsv={handleExportCsv}
        onSelectJob={(job) => setSelectedJob(job)}
        initialViewMode="grid"
      />

      {selectedJob ? (
        <JobDetailDialog job={selectedJob} onClose={() => setSelectedJob(null)} />
      ) : null}
    </div>
  );
}
