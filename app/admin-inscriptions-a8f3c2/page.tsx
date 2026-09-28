'use client';

import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import type { Participant } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  Users,
  Calendar,
  Search,
  FileSpreadsheet,
  ArrowLeft,
  Shield,
  Sparkles,
  Inbox,
  X,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchParticipants();
  }, []);

  // ✅ MODIFIÉ : passe par la route API sécurisée au lieu d'appeler Supabase directement
  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/participants');
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Erreur ${res.status}`);
      }
      const { participants } = await res.json();
      setParticipants(participants || []);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erreur',
        description:
          err instanceof Error
            ? err.message
            : 'Impossible de charger les données.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const uniqueDates = Array.from(
    new Set(participants.map((p) => p.date_participation))
  ).sort((a, b) => b.localeCompare(a));

  const filtered = participants.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      `${p.prenom} ${p.nom} ${p.entreprise} ${p.poste} ${p.email || ''} ${p.telephone || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesDate = dateFilter === 'all' || p.date_participation === dateFilter;

    return matchesSearch && matchesDate;
  });

  const exportToExcel = () => {
    if (filtered.length === 0) {
      toast({
        title: 'Aucune donnée',
        description: 'Il n\'y a aucune inscription à exporter.',
        variant: 'destructive',
      });
      return;
    }

    const rows = filtered.map((p, index) => ({
      'N°': index + 1,
      'Nom': p.nom,
      'Prénom': p.prenom,
      'Entreprise': p.entreprise,
      'Poste': p.poste,
      'Email': p.email || '',
      'Téléphone': p.telephone || '',
      'Pays': p.pays,
      'Date de participation': p.date_participation,
      'Thématique panel': p.thematique_panel,
      'Date d\'inscription': format(new Date(p.created_at), 'dd/MM/yyyy HH:mm'),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    ws['!cols'] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 25 },
      { wch: 30 },
      { wch: 20 },
      { wch: 25 },
      { wch: 18 },
      { wch: 30 },
      { wch: 22 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Participants');

    const dateStr = format(new Date(), 'dd-MM-yyyy');
    XLSX.writeFile(wb, `participants_${dateStr}.xlsx`);

    toast({
      title: 'Export réussi',
      description: `${filtered.length} participant(s) exporté(s) au format Excel.`,
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
  };

  const hasActiveFilters = searchQuery !== '' || dateFilter !== 'all';
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayCount = participants.filter((p) => {
    const d = new Date(p.created_at);
    return format(d, 'yyyy-MM-dd') === todayStr;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Décor de fond */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="relative px-4 py-8 sm:py-12 max-w-7xl mx-auto">
        {/* ============ HEADER ============ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-lg shadow-indigo-500/30 text-white">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  Espace administrateur
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl tracking-tight">
                Gestion des participants
              </h1>
              <p className="text-slate-500 mt-0.5 text-sm">
                Consultez, filtrez et exportez les inscriptions à l&apos;événement
              </p>
            </div>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 bg-white/80 backdrop-blur hover:bg-white hover:border-slate-300 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au formulaire
            </Button>
          </Link>
        </div>

        {/* ============ STATS ============ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Total inscrits"
            value={participants.length}
            color="from-indigo-500 to-indigo-700"
            ring="ring-indigo-100"
            trend={todayCount > 0 ? `+${todayCount} aujourd'hui` : undefined}
          />
          <StatCard
            icon={<Calendar className="h-5 w-5" />}
            label="Dates distinctes"
            value={uniqueDates.length}
            color="from-emerald-500 to-emerald-700"
            ring="ring-emerald-100"
          />
          <StatCard
            icon={<FileSpreadsheet className="h-5 w-5" />}
            label="Résultats filtrés"
            value={filtered.length}
            color="from-slate-700 to-slate-900"
            ring="ring-slate-200"
          />
        </div>

        {/* ============ CARTE PRINCIPALE ============ */}
        <Card className="border border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white/80 backdrop-blur">
          {/* Header interne */}
          <CardHeader className="border-b border-slate-100 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Liste des participants
                </CardTitle>
                <CardDescription className="text-slate-500 mt-1">
                  {filtered.length} résultat{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''} sur {participants.length}
                </CardDescription>
              </div>
              <Button
                onClick={exportToExcel}
                disabled={filtered.length === 0}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:shadow-emerald-500/50 hover:-translate-y-0.5"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter en Excel
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* ============ FILTRES ============ */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 block">
                  Rechercher
                </Label>
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input
                    placeholder="Nom, prénom, entreprise, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Effacer la recherche"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="sm:w-72">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 block">
                  Date de participation
                </Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all">
                    <SelectValue placeholder="Toutes les dates" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        Toutes les dates
                      </span>
                    </SelectItem>
                    {uniqueDates.map((d) => (
                      <SelectItem key={d} value={d}>
                        {format(new Date(d), 'dd MMMM yyyy', { locale: fr })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {hasActiveFilters && (
                <div className="sm:self-end">
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-11 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    Réinitialiser
                  </Button>
                </div>
              )}
            </div>

            {/* ============ TABLEAU ============ */}
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <div className="overflow-x-auto max-h-[600px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10">
                    <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                      <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wide w-14">N°</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wide">Participant</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wide">Entreprise</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wide">Poste</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wide">Contact</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wide">Pays</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wide">Date</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wide">Thématique</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <SkeletonRows />
                    ) : filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-20">
                          <EmptyState
                            hasData={participants.length > 0}
                            onClear={clearFilters}
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((p, index) => (
                        <TableRow
                          key={p.id}
                          className="group hover:bg-indigo-50/40 transition-colors border-b border-slate-100 last:border-0"
                        >
                          <TableCell className="text-slate-400 font-medium tabular-nums text-sm">
                            {String(index + 1).padStart(2, '0')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 font-semibold text-xs border border-indigo-200/50">
                                {p.prenom?.[0]?.toUpperCase()}
                                {p.nom?.[0]?.toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 truncate">
                                  {p.prenom} {p.nom}
                                </p>
                                {p.email && (
                                  <p className="text-xs text-slate-500 truncate">
                                    {p.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-700 font-medium text-sm">
                            {p.entreprise}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {p.poste}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {p.telephone ? (
                              <span className="tabular-nums">{p.telephone}</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                              {p.pays}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-600 whitespace-nowrap text-sm">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {format(new Date(p.date_participation), 'dd/MM/yyyy')}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[220px]">
                            <span className="inline-block text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 truncate max-w-full">
                              {p.thematique_panel}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Footer info */}
            {!loading && filtered.length > 0 && (
              <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                <p>
                  Affichage de <span className="font-semibold text-slate-700">{filtered.length}</span> participant{filtered.length > 1 ? 's' : ''}
                </p>
                <p className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  Données mises à jour en temps réel
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signature */}
        <p className="text-center text-xs text-slate-400 mt-8">
          Panneau d&apos;administration · Sécurisé & confidentiel
        </p>
      </div>
      <Toaster />
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */
function StatCard({
  icon,
  label,
  value,
  color,
  ring,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  ring: string;
  trend?: string;
}) {
  return (
    <Card className="group border border-slate-200/80 shadow-lg shadow-slate-200/40 rounded-2xl overflow-hidden bg-white/80 backdrop-blur transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-0.5">
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-lg ring-4 ${ring} transition-transform duration-300 group-hover:scale-105`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-900 tabular-nums">
              {value}
            </p>
            {trend && (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                {trend}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   SKELETON LOADER
============================================================ */
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i} className="border-b border-slate-100">
          <TableCell>
            <div className="h-4 w-6 rounded bg-slate-100 animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-100 animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 rounded bg-slate-100 animate-pulse" />
                <div className="h-3 w-40 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="h-3.5 w-28 rounded bg-slate-100 animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="h-3.5 w-24 rounded bg-slate-100 animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="h-3.5 w-28 rounded bg-slate-100 animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="h-6 w-16 rounded-full bg-slate-100 animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="h-3.5 w-20 rounded bg-slate-100 animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="h-6 w-28 rounded-full bg-slate-100 animate-pulse" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */
function EmptyState({
  hasData,
  onClear,
}: {
  hasData: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
        <Inbox className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">
        {hasData ? 'Aucun résultat' : 'Aucun participant pour le moment'}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">
        {hasData
          ? 'Aucun participant ne correspond à vos critères de recherche.'
          : 'Les inscriptions apparaîtront ici dès qu\'un participant remplira le formulaire.'}
      </p>
      {hasData && (
        <Button
          variant="outline"
          onClick={onClear}
          className="rounded-xl border-slate-200"
        >
          <X className="h-4 w-4 mr-1.5" />
          Réinitialiser les filtres
        </Button>
      )}
    </div>
  );
}