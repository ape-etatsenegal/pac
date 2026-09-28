'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import Image from 'next/image';
import type { Participant } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// 🎨 Palette PAC — rouge / noir / blanc
const PAC = {
  red: '#D62828',
  redDark: '#A81E1E',
  redLight: '#F8D7D7',
  black: '#1A1A1A',
  blackSoft: '#2D2D2D',
  gray: '#F5F5F5',
  grayBorder: '#E5E5E5',
  white: '#FFFFFF',
};

export default function AdminPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // 📄 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = useCallback(async () => {
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
      toast.error('Erreur de chargement', {
        description:
          err instanceof Error
            ? err.message
            : 'Impossible de charger les données.',
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const uniqueDates = useMemo(
    () =>
      Array.from(new Set(participants.map((p) => p.date_participation))).sort(
        (a, b) => b.localeCompare(a),
      ),
    [participants],
  );

  const filtered = useMemo(() => {
    return participants.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        `${p.prenom} ${p.nom} ${p.entreprise} ${p.poste} ${p.email || ''} ${p.telephone || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesDate = dateFilter === 'all' || p.date_participation === dateFilter;

      return matchesSearch && matchesDate;
    });
  }, [participants, searchQuery, dateFilter]);

  // 📄 Pagination — calculs
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginated = filtered.slice(startIndex, endIndex);

  // Reset page si les filtres changent et que la page actuelle dépasse
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Reset page quand on change les filtres
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, pageSize]);

  const exportToExcel = () => {
    if (filtered.length === 0) {
      toast.error('Aucune donnée', {
        description: "Il n'y a aucune inscription à exporter.",
        position: 'top-center',
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
      "Date d'inscription": format(new Date(p.created_at), 'dd/MM/yyyy HH:mm'),
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

    toast.success('Export réussi', {
      description: `${filtered.length} participant(s) exporté(s) au format Excel.`,
      position: 'top-center',
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery !== '' || dateFilter !== 'all';
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayCount = participants.filter((p) => {
    const d = new Date(p.created_at);
    return format(d, 'yyyy-MM-dd') === todayStr;
  }).length;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${PAC.gray} 0%, #FFF5F5 50%, ${PAC.gray} 100%)`,
      }}
    >
      {/* Motif PAC décoratif en arrière-plan */}
      <div
        className="pointer-events-none absolute -top-60 -right-60 h-[700px] w-[700px] opacity-[0.05]"
        style={{
          backgroundImage: 'url(/motif-pac.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-60 -left-60 h-[700px] w-[700px] opacity-[0.05]"
        style={{
          backgroundImage: 'url(/motif-pac.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="relative px-4 py-8 sm:py-12 max-w-7xl mx-auto">
        {/* ============ HEADER ============ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            {/* Logo PAC */}
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg p-2"
              style={{ border: `1px solid ${PAC.grayBorder}` }}
            >
              <Image
                src="/logo-pac.png"
                alt="Logo PAC"
                width={56}
                height={56}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{ color: PAC.redDark, backgroundColor: PAC.redLight }}
                >
                  <Shield className="h-3 w-3" />
                  Espace administrateur
                </span>
              </div>
              <h1 className="text-2xl font-bold sm:text-3xl tracking-tight" style={{ color: PAC.black }}>
                Gestion des participants
              </h1>
              <p className="mt-0.5 text-sm" style={{ color: PAC.blackSoft }}>
                Consultez, filtrez et exportez les inscriptions à l&apos;événement
              </p>
            </div>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              className="rounded-xl bg-white/80 backdrop-blur shadow-sm"
              style={{ borderColor: PAC.grayBorder, color: PAC.black }}
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
            color={`linear-gradient(135deg, ${PAC.red}, ${PAC.redDark})`}
            ring={`rgba(214, 40, 40, 0.15)`}
            trend={todayCount > 0 ? `+${todayCount} aujourd'hui` : undefined}
          />
          <StatCard
            icon={<Calendar className="h-5 w-5" />}
            label="Dates distinctes"
            value={uniqueDates.length}
            color={`linear-gradient(135deg, ${PAC.black}, ${PAC.blackSoft})`}
            ring={`rgba(26, 26, 26, 0.12)`}
          />
          <StatCard
            icon={<FileSpreadsheet className="h-5 w-5" />}
            label="Résultats filtrés"
            value={filtered.length}
            color={`linear-gradient(135deg, ${PAC.black}, ${PAC.red})`}
            ring={`rgba(214, 40, 40, 0.12)`}
          />
        </div>

        {/* ============ CARTE PRINCIPALE ============ */}
        <Card
          className="border shadow-xl rounded-2xl overflow-hidden bg-white/90 backdrop-blur"
          style={{ borderColor: PAC.grayBorder }}
        >
          {/* Header interne */}
          <CardHeader className="border-b pb-5" style={{ borderColor: PAC.grayBorder }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: PAC.black }}>
                  <span
                    className="inline-block h-2 w-2 rounded-full animate-pulse"
                    style={{ backgroundColor: PAC.red }}
                  />
                  Liste des participants
                </CardTitle>
                <CardDescription className="mt-1" style={{ color: PAC.blackSoft }}>
                  {filtered.length} résultat{filtered.length > 1 ? 's' : ''} affiché
                  {filtered.length > 1 ? 's' : ''} sur {participants.length}
                </CardDescription>
              </div>
              <Button
                onClick={exportToExcel}
                disabled={filtered.length === 0}
                className="text-white rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(90deg, ${PAC.red}, ${PAC.redDark})`,
                  boxShadow: `0 10px 30px rgba(214, 40, 40, 0.25)`,
                }}
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
                <Label
                  className="text-xs font-semibold uppercase tracking-wide mb-2 block"
                  style={{ color: PAC.blackSoft }}
                >
                  Rechercher
                </Label>
                <div className="relative group">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors"
                    style={{ color: PAC.blackSoft }}
                  />
                  <Input
                    placeholder="Nom, prénom, entreprise, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-11 rounded-xl transition-all"
                    style={{
                      borderColor: PAC.grayBorder,
                      backgroundColor: PAC.gray,
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: PAC.blackSoft }}
                      aria-label="Effacer la recherche"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="sm:w-72">
                <Label
                  className="text-xs font-semibold uppercase tracking-wide mb-2 block"
                  style={{ color: PAC.blackSoft }}
                >
                  Date de participation
                </Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger
                    className="h-11 rounded-xl transition-all"
                    style={{
                      borderColor: PAC.grayBorder,
                      backgroundColor: PAC.gray,
                    }}
                  >
                    <SelectValue placeholder="Toutes les dates" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" style={{ color: PAC.blackSoft }} />
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
                    className="h-11 rounded-xl"
                    style={{ color: PAC.blackSoft }}
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    Réinitialiser
                  </Button>
                </div>
              )}
            </div>

            {/* ============ TABLEAU ============ */}
            <div className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: PAC.grayBorder }}>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow
                      className="border-b"
                      style={{
                        backgroundColor: PAC.gray,
                        borderColor: PAC.grayBorder,
                      }}
                    >
                      <TableHead
                        className="font-semibold text-xs uppercase tracking-wide w-14"
                        style={{ color: PAC.black }}
                      >
                        N°
                      </TableHead>
                      <TableHead
                        className="font-semibold text-xs uppercase tracking-wide"
                        style={{ color: PAC.black }}
                      >
                        Participant
                      </TableHead>
                      <TableHead
                        className="font-semibold text-xs uppercase tracking-wide"
                        style={{ color: PAC.black }}
                      >
                        Entreprise
                      </TableHead>
                      <TableHead
                        className="font-semibold text-xs uppercase tracking-wide"
                        style={{ color: PAC.black }}
                      >
                        Poste
                      </TableHead>
                      <TableHead
                        className="font-semibold text-xs uppercase tracking-wide"
                        style={{ color: PAC.black }}
                      >
                        Contact
                      </TableHead>
                      <TableHead
                        className="font-semibold text-xs uppercase tracking-wide"
                        style={{ color: PAC.black }}
                      >
                        Pays
                      </TableHead>
                      <TableHead
                        className="font-semibold text-xs uppercase tracking-wide"
                        style={{ color: PAC.black }}
                      >
                        Date
                      </TableHead>
                      <TableHead
                        className="font-semibold text-xs uppercase tracking-wide"
                        style={{ color: PAC.black }}
                      >
                        Thématique
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <SkeletonRows />
                    ) : paginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-20">
                          <EmptyState
                            hasData={participants.length > 0}
                            onClear={clearFilters}
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((p, index) => {
                        const globalIndex = startIndex + index + 1;
                        return (
                          <TableRow
                            key={p.id}
                            className="group transition-colors border-b last:border-0"
                            style={{ borderColor: PAC.grayBorder }}
                          >
                            <TableCell className="font-medium tabular-nums text-sm" style={{ color: PAC.blackSoft }}>
                              {String(globalIndex).padStart(2, '0')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-semibold text-xs border text-white"
                                  style={{
                                    background: `linear-gradient(135deg, ${PAC.red}, ${PAC.redDark})`,
                                    borderColor: PAC.redDark,
                                  }}
                                >
                                  {p.prenom?.[0]?.toUpperCase()}
                                  {p.nom?.[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold truncate" style={{ color: PAC.black }}>
                                    {p.prenom} {p.nom}
                                  </p>
                                  {p.email && (
                                    <p className="text-xs truncate" style={{ color: PAC.blackSoft }}>
                                      {p.email}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-sm" style={{ color: PAC.black }}>
                              {p.entreprise}
                            </TableCell>
                            <TableCell className="text-sm" style={{ color: PAC.blackSoft }}>
                              {p.poste}
                            </TableCell>
                            <TableCell className="text-sm" style={{ color: PAC.blackSoft }}>
                              {p.telephone ? (
                                <span className="tabular-nums">{p.telephone}</span>
                              ) : (
                                <span style={{ color: PAC.grayBorder }}>—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span
                                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border"
                                style={{
                                  color: PAC.black,
                                  backgroundColor: PAC.gray,
                                  borderColor: PAC.grayBorder,
                                }}
                              >
                                {p.pays}
                              </span>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm" style={{ color: PAC.blackSoft }}>
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" style={{ color: PAC.blackSoft }} />
                                {format(new Date(p.date_participation), 'dd/MM/yyyy')}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-[220px]">
                              <span
                                className="inline-block text-xs font-medium px-2.5 py-1 rounded-full border truncate max-w-full"
                                style={{
                                  color: PAC.redDark,
                                  backgroundColor: PAC.redLight,
                                  borderColor: PAC.redLight,
                                }}
                              >
                                {p.thematique_panel}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* ============ PAGINATION ============ */}
            {!loading && filtered.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                {/* Info + sélecteur pageSize */}
                <div className="flex items-center gap-3 text-xs" style={{ color: PAC.blackSoft }}>
                  <p>
                    Affichage de{' '}
                    <span className="font-semibold" style={{ color: PAC.black }}>
                      {startIndex + 1}
                    </span>{' '}
                    à{' '}
                    <span className="font-semibold" style={{ color: PAC.black }}>
                      {Math.min(endIndex, filtered.length)}
                    </span>{' '}
                    sur{' '}
                    <span className="font-semibold" style={{ color: PAC.black }}>
                      {filtered.length}
                    </span>{' '}
                    participant{filtered.length > 1 ? 's' : ''}
                  </p>
                  <div className="hidden sm:block h-4 w-px" style={{ backgroundColor: PAC.grayBorder }} />
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline">Par page :</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(v) => setPageSize(Number(v))}
                    >
                      <SelectTrigger className="h-8 w-[70px] rounded-lg text-xs" style={{ borderColor: PAC.grayBorder }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        {[10, 25, 50, 100].map((size) => (
                          <SelectItem key={size} value={String(size)}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Boutons de navigation */}
                <div className="flex items-center gap-1">
                  <PaginationButton
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    aria-label="Première page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </PaginationButton>
                  <PaginationButton
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Page précédente"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </PaginationButton>

                  {/* Numéros de page */}
                  <div className="flex items-center gap-1 mx-2">
                    {getPageNumbers(currentPage, totalPages).map((page, i) =>
                      page === '...' ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="px-2 text-xs"
                          style={{ color: PAC.blackSoft }}
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page as number)}
                          className="h-9 min-w-[36px] px-3 rounded-lg text-sm font-medium transition-all"
                          style={
                            currentPage === page
                              ? {
                                  background: `linear-gradient(135deg, ${PAC.red}, ${PAC.redDark})`,
                                  color: 'white',
                                  boxShadow: `0 4px 12px rgba(214, 40, 40, 0.3)`,
                                }
                              : {
                                  color: PAC.black,
                                  backgroundColor: 'transparent',
                                }
                          }
                        >
                          {page}
                        </button>
                      ),
                    )}
                  </div>

                  <PaginationButton
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Page suivante"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </PaginationButton>
                  <PaginationButton
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    aria-label="Dernière page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </PaginationButton>
                </div>
              </div>
            )}

            {/* Footer info */}
            {!loading && filtered.length > 0 && (
              <div className="flex items-center justify-between mt-4 text-xs" style={{ color: PAC.blackSoft }}>
                <p className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" style={{ color: PAC.red }} />
                  Données mises à jour en temps réel
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signature */}
        <p className="text-center text-xs mt-8" style={{ color: PAC.blackSoft }}>
          Panneau d&apos;administration · Sécurisé & confidentiel
        </p>
      </div>
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
    <Card
      className="group border shadow-lg rounded-2xl overflow-hidden bg-white/90 backdrop-blur transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
      style={{ borderColor: PAC.grayBorder }}
    >
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105"
          style={{ background: color, boxShadow: `0 0 0 4px ${ring}` }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: PAC.blackSoft }}
          >
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tabular-nums" style={{ color: PAC.black }}>
              {value}
            </p>
            {trend && (
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                style={{
                  color: PAC.redDark,
                  backgroundColor: PAC.redLight,
                  borderColor: PAC.redLight,
                }}
              >
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
   PAGINATION BUTTON
============================================================ */
function PaginationButton({
  onClick,
  disabled,
  children,
  'aria-label': ariaLabel,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  'aria-label': string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex h-9 w-9 items-center justify-center rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        color: PAC.black,
        backgroundColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}

/* ============================================================
   GET PAGE NUMBERS — logique pagination intelligente
============================================================ */
function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];

  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total);
  } else if (current >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }

  return pages;
}

/* ============================================================
   SKELETON LOADER
============================================================ */
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i} className="border-b" style={{ borderColor: PAC.grayBorder }}>
          <TableCell>
            <div className="h-4 w-6 rounded animate-pulse" style={{ backgroundColor: PAC.gray }} />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full animate-pulse" style={{ backgroundColor: PAC.gray }} />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 rounded animate-pulse" style={{ backgroundColor: PAC.gray }} />
                <div className="h-3 w-40 rounded animate-pulse" style={{ backgroundColor: PAC.gray }} />
              </div>
            </div>
          </TableCell>
          {[1, 2, 3, 4, 5, 6].map((j) => (
            <TableCell key={j}>
              <div
                className="h-3.5 w-24 rounded animate-pulse"
                style={{ backgroundColor: PAC.gray }}
              />
            </TableCell>
          ))}
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
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
        style={{ backgroundColor: PAC.gray }}
      >
        <Inbox className="h-8 w-8" style={{ color: PAC.blackSoft }} />
      </div>
      <h3 className="text-base font-semibold mb-1" style={{ color: PAC.black }}>
        {hasData ? 'Aucun résultat' : 'Aucun participant pour le moment'}
      </h3>
      <p className="text-sm max-w-sm mb-4" style={{ color: PAC.blackSoft }}>
        {hasData
          ? 'Aucun participant ne correspond à vos critères de recherche.'
          : "Les inscriptions apparaîtront ici dès qu'un participant remplira le formulaire."}
      </p>
      {hasData && (
        <Button
          variant="outline"
          onClick={onClear}
          className="rounded-xl"
          style={{ borderColor: PAC.grayBorder, color: PAC.black }}
        >
          <X className="h-4 w-4 mr-1.5" />
          Réinitialiser les filtres
        </Button>
      )}
    </div>
  );
}