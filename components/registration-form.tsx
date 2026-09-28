'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dynamic from 'next/dynamic';
import { supabase, type ParticipantInsert } from '@/lib/supabase';
import { countries } from '@/lib/countries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import {
  CalendarIcon,
  CheckCircle2,
  User,
  Building2,
  Mail,
  Phone,
  Globe,
  Briefcase,
  PanelTop,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PartyPopper,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Import dynamique de react-select (obligatoire avec Next.js App Router)
const Select = dynamic(() => import('react-select'), { ssr: false });

const schema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
  entreprise: z.string().min(1, "L'entreprise est requise"),
  poste: z.string().min(1, 'Le poste est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  telephone: z.string().optional(),
  pays: z.string().min(1, 'Le pays est requis'),
  date_participation: z.string().min(1, 'La date est requise'),
  thematique_panel: z.string().min(1, 'La thématique est requise'),
});

type FormValues = z.infer<typeof schema>;

export default function RegistrationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nom: '',
      prenom: '',
      entreprise: '',
      poste: '',
      email: '',
      telephone: '',
      pays: '',
      date_participation: '',
      thematique_panel: '',
    },
  });

  const watchedDate = watch('date_participation');
  const watchedPays = watch('pays');

  // Récupérer l'indicatif du pays sélectionné
  const dialCode = useMemo(() => {
    const found = countries.find((c) => c.name === watchedPays);
    return found?.code || '';
  }, [watchedPays]);

  // Options pour react-select : { value, label, code, flag }
  const countryOptions = useMemo(
    () =>
      countries.map((country) => ({
        value: country.name,
        label: `${country.name} (${country.code})`,
        code: country.code,
        flag: country.flag,
      })),
    []
  );

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const insert: ParticipantInsert = {
        nom: data.nom,
        prenom: data.prenom,
        entreprise: data.entreprise,
        poste: data.poste,
        email: data.email || null,
        telephone: data.telephone || null,
        pays: data.pays,
        date_participation: data.date_participation,
        thematique_panel: data.thematique_panel,
      };

      const { error } = await supabase.from('participants').insert(insert);
      if (error) throw error;

      setSubmittedData(data);
      setSubmitted(true);
      toast({
        title: 'Inscription réussie',
        description: 'Vos informations ont été enregistrées avec succès.',
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.",
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setSelectedDate(undefined);
    setSubmitted(false);
    setSubmittedData(null);
  };

  /* ============================================================
     ÉCRAN DE CONFIRMATION
  ============================================================ */
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-indigo-50 to-emerald-50 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
        </div>

        <Card className="relative w-full max-w-xl border border-slate-200/60 shadow-2xl shadow-emerald-200/40 rounded-3xl overflow-hidden bg-white/90 backdrop-blur">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-emerald-600 to-indigo-600" />

          <CardContent className="pt-10 pb-10 px-8 text-center">
            <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
              <div className="absolute inset-0 rounded-full bg-emerald-100" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="h-11 w-11 text-white" strokeWidth={2} />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full mb-4">
              <PartyPopper className="h-3 w-3" />
              Inscription confirmée
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Merci {submittedData?.prenom} !
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed max-w-md mx-auto">
              Votre inscription a bien été enregistrée. Nous avons hâte de vous
              accueillir à l&apos;événement.
            </p>

            {submittedData && (
              <div className="text-left bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                  Récapitulatif
                </p>
                <SummaryRow
                  icon={<User className="h-4 w-4" />}
                  label="Participant"
                  value={`${submittedData.prenom} ${submittedData.nom}`}
                />
                <SummaryRow
                  icon={<Building2 className="h-4 w-4" />}
                  label="Entreprise"
                  value={submittedData.entreprise}
                />
                <SummaryRow
                  icon={<Briefcase className="h-4 w-4" />}
                  label="Poste"
                  value={submittedData.poste}
                />
                <SummaryRow
                  icon={<Globe className="h-4 w-4" />}
                  label="Pays"
                  value={submittedData.pays}
                />
                <SummaryRow
                  icon={<CalendarIcon className="h-4 w-4" />}
                  label="Date de participation"
                  value={format(new Date(submittedData.date_participation), 'dd MMMM yyyy', { locale: fr })}
                />
                <SummaryRow
                  icon={<PanelTop className="h-4 w-4" />}
                  label="Thématique"
                  value={submittedData.thematique_panel}
                />
              </div>
            )}

            <Button
              onClick={handleReset}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 h-12 font-semibold shadow-lg transition-all hover:-translate-y-0.5"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Nouvelle inscription
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-6">
              <ShieldCheck className="h-3.5 w-3.5" />
              Vos données sont traitées de manière confidentielle
            </p>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    );
  }

  /* ============================================================
     FORMULAIRE
  ============================================================ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-emerald-50 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-72 w-72 rounded-full bg-sky-200/20 blur-3xl" />
      </div>

      <div className="relative px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-2xl">
          {/* EN-TÊTE */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-5">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-emerald-600 shadow-xl shadow-indigo-500/30">
                <User className="h-8 w-8 text-white" strokeWidth={1.5} />
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 border-2 border-white">
                  <Sparkles className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full mb-4">
              <Sparkles className="h-3 w-3" />
              Formulaire officiel
            </div>

            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-3 tracking-tight">
              Inscription à l&apos;événement
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-md mx-auto">
              Renseignez vos informations pour confirmer votre participation
            </p>
          </div>

          {/* CARTE FORMULAIRE */}
          <Card className="border border-slate-200/60 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white/90 backdrop-blur">
            <div className="h-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500" />

            <CardHeader className="pb-5 border-b border-slate-100">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    Formulaire de renseignement
                  </CardTitle>
                  <CardDescription className="text-slate-500 mt-1">
                    Les champs marqués d&apos;un{' '}
                    <span className="text-red-500 font-medium">*</span> sont obligatoires
                  </CardDescription>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  2 min environ
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* SECTION 1 */}
                <SectionTitle
                  number="01"
                  title="Vos informations"
                  subtitle="Identité et coordonnées professionnelles"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Prénom" required error={errors.prenom?.message} icon={<User className="h-4 w-4" />}>
                    <InputWithIcon icon={<User className="h-4 w-4" />}>
                      <Input
                        {...register('prenom')}
                        placeholder="Votre prénom"
                        className="rounded-xl h-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 pl-10 transition-all"
                      />
                    </InputWithIcon>
                  </FormField>

                  <FormField label="Nom" required error={errors.nom?.message} icon={<User className="h-4 w-4" />}>
                    <InputWithIcon icon={<User className="h-4 w-4" />}>
                      <Input
                        {...register('nom')}
                        placeholder="Votre nom"
                        className="rounded-xl h-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 pl-10 transition-all"
                      />
                    </InputWithIcon>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Entreprise" required error={errors.entreprise?.message} icon={<Building2 className="h-4 w-4" />}>
                    <InputWithIcon icon={<Building2 className="h-4 w-4" />}>
                      <Input
                        {...register('entreprise')}
                        placeholder="Nom de l'entreprise"
                        className="rounded-xl h-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 pl-10 transition-all"
                      />
                    </InputWithIcon>
                  </FormField>

                  <FormField label="Poste occupé" required error={errors.poste?.message} icon={<Briefcase className="h-4 w-4" />}>
                    <InputWithIcon icon={<Briefcase className="h-4 w-4" />}>
                      <Input
                        {...register('poste')}
                        placeholder="Votre poste"
                        className="rounded-xl h-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 pl-10 transition-all"
                      />
                    </InputWithIcon>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Email" error={errors.email?.message} icon={<Mail className="h-4 w-4" />} optional>
                    <InputWithIcon icon={<Mail className="h-4 w-4" />}>
                      <Input
                        type="email"
                        {...register('email')}
                        placeholder="exemple@email.com"
                        className="rounded-xl h-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 pl-10 transition-all"
                      />
                    </InputWithIcon>
                  </FormField>

                  {/* Téléphone avec indicatif automatique selon le pays */}
                  <FormField label="Téléphone" error={errors.telephone?.message} icon={<Phone className="h-4 w-4" />} optional>
                    <div className="flex items-stretch rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100 transition-all h-11">
                      <span className="flex items-center gap-1.5 px-3 bg-slate-100 border-r border-slate-200 text-slate-700 text-sm font-medium tabular-nums">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {dialCode || '+...'}
                      </span>
                      <input
                        type="tel"
                        {...register('telephone')}
                        placeholder="6 12 34 56 78"
                        className="flex-1 px-3 outline-none text-base bg-transparent"
                      />
                    </div>
                  </FormField>
                </div>

                {/* PAYS avec drapeaux — react-select */}
                <FormField label="Pays" required error={errors.pays?.message} icon={<Globe className="h-4 w-4" />}>
                  <Controller
                    name="pays"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={countryOptions}
                        value={countryOptions.find((o) => o.value === field.value) || null}
                        onChange={(opt: any) => field.onChange(opt?.value || '')}
                        placeholder="Sélectionnez votre pays"
                        isSearchable
                        formatOptionLabel={(opt: any) => (
                          <div className="flex items-center gap-2">
                            {opt.flag && (
                              <img
                                src={`https://flagcdn.com/20x15/${opt.flag.toLowerCase()}.png`}
                                alt={opt.value}
                                width={20}
                                height={15}
                                className="inline-block rounded-sm shadow-sm"
                              />
                            )}
                            <span>
                              {opt.value}{' '}
                              <span className="text-slate-400">({opt.code})</span>
                            </span>
                          </div>
                        )}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            minHeight: '2.75rem',
                            border: state.isFocused
                              ? '1px solid #818cf8'
                              : '1px solid #e2e8f0',
                            borderRadius: '0.75rem',
                            padding: '0 0.25rem',
                            fontSize: '1rem',
                            backgroundColor: state.isFocused ? 'white' : 'rgba(248,250,252,0.5)',
                            boxShadow: state.isFocused
                              ? '0 0 0 4px rgba(129,140,248,0.15)'
                              : 'none',
                            '&:hover': { borderColor: '#818cf8' },
                            transition: 'all 0.2s',
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected
                              ? '#4f46e5'
                              : state.isFocused
                              ? '#eef2ff'
                              : 'white',
                            color: state.isSelected ? 'white' : '#1e293b',
                            fontSize: '0.95rem',
                            padding: '0.6rem 1rem',
                            cursor: 'pointer',
                          }),
                          menu: (base) => ({
                            ...base,
                            borderRadius: '0.75rem',
                            overflow: 'hidden',
                            boxShadow: '0 10px 40px rgba(15,23,42,0.12)',
                            border: '1px solid #e2e8f0',
                          }),
                          placeholder: (base) => ({
                            ...base,
                            color: '#94a3b8',
                          }),
                        }}
                      />
                    )}
                  />
                </FormField>

                {/* SECTION 2 */}
                <div className="pt-2">
                  <SectionTitle
                    number="02"
                    title="Votre participation"
                    subtitle="Date et thématique souhaitée"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Date */}
                  <FormField
                    label="Date de participation"
                    required
                    error={errors.date_participation?.message}
                    icon={<CalendarIcon className="h-4 w-4" />}
                  >
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal rounded-xl h-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all',
                            !watchedDate && 'text-slate-400'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                          {watchedDate
                            ? format(new Date(watchedDate), 'dd MMMM yyyy', { locale: fr })
                            : 'Sélectionnez une date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) {
                              setSelectedDate(date);
                              setValue('date_participation', format(date, 'yyyy-MM-dd'), {
                                shouldValidate: true,
                              });
                              setDatePickerOpen(false);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormField>

                  {/* Thématique — CHAMP TEXTE LIBRE */}
                  <FormField
                    label="Thématique du panel"
                    required
                    error={errors.thematique_panel?.message}
                    icon={<PanelTop className="h-4 w-4" />}
                  >
                    <InputWithIcon icon={<PanelTop className="h-4 w-4" />}>
                      <Input
                        {...register('thematique_panel')}
                        placeholder="Ex : Intelligence Artificielle, Transition énergétique..."
                        className="rounded-xl h-11 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 pl-10 transition-all"
                      />
                    </InputWithIcon>
                  </FormField>
                </div>

                {/* BOUTON */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="group w-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-emerald-600 hover:from-indigo-700 hover:via-indigo-700 hover:to-emerald-700 text-white rounded-xl py-6 text-base font-semibold shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Enregistrement en cours...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Confirmer mon inscription
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Vos données sont traitées de manière confidentielle et sécurisée</span>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-slate-400 mt-6">
            Besoin d&apos;aide ? Contactez l&apos;équipe organisatrice.
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

/* ============================================================
   COMPOSANTS AUXILIAIRES
============================================================ */

function SectionTitle({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-emerald-100 text-indigo-700 font-bold text-sm border border-indigo-200/50">
        {number}
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  optional,
  error,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
        <span className="text-slate-400">{icon}</span>
        {label}
        {required && <span className="text-red-500">*</span>}
        {optional && (
          <span className="text-slate-400 text-xs font-normal">(optionnel)</span>
        )}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
          {error}
        </p>
      )}
    </div>
  );
}

function InputWithIcon({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10">
        {icon}
      </span>
      {children}
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div className="flex items-center gap-2.5 text-slate-500 text-sm">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500">
          {icon}
        </span>
        {label}
      </div>
      <span className="text-sm font-semibold text-slate-900 text-right truncate max-w-[60%]">
        {value}
      </span>
    </div>
  );
}