"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dynamic from "next/dynamic";
import Image from "next/image";
import { toast } from "sonner";
import { supabase, type ParticipantInsert } from "@/lib/supabase";
import { countries } from "@/lib/countries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Import dynamique de react-select (obligatoire avec Next.js App Router)
const Select = dynamic(() => import("react-select"), { ssr: false });

// 🎨 Palette PAC — rouge / noir / blanc
const PAC = {
  red: "#D62828",
  redDark: "#A81E1E",
  redLight: "#F8D7D7",
  black: "#1A1A1A",
  blackSoft: "#2D2D2D",
  gray: "#F5F5F5",
  grayBorder: "#E5E5E5",
  white: "#FFFFFF",
};

const schema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  entreprise: z.string().min(1, "L'entreprise est requise"),
  poste: z.string().min(1, "Le poste est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  telephone: z.string().optional(),
  pays: z.string().min(1, "Le pays est requis"),
  date_participation: z.string().min(1, "La date est requise"),
  thematique_panel: z.string().min(1, "La thématique est requise"),
});

type FormValues = z.infer<typeof schema>;

export default function RegistrationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null);

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
      nom: "",
      prenom: "",
      entreprise: "",
      poste: "",
      email: "",
      telephone: "",
      pays: "",
      date_participation: "",
      thematique_panel: "",
    },
  });

  const watchedDate = watch("date_participation");
  const watchedPays = watch("pays");

  const dialCode = useMemo(() => {
    const found = countries.find((c) => c.name === watchedPays);
    return found?.code || "";
  }, [watchedPays]);

  const countryOptions = useMemo(
    () =>
      countries.map((country) => ({
        value: country.name,
        label: `${country.name} (${country.code})`,
        code: country.code,
        flag: country.flag,
      })),
    [],
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

      const { error } = await supabase.from("participants").insert(insert);
      if (error) throw error;

      setSubmittedData(data);
      setSubmitted(true);

      // ✅ Toast de succès VERT, en haut au centre
      toast.success("Inscription réussie !", {
        description: "Vos informations ont bien été enregistrées.",
        duration: 5000,
        position: "top-center",
      });
    } catch (err) {
      // ✅ Toast d'erreur ROUGE, en haut au centre
      toast.error("Erreur d'enregistrement", {
        description:
          "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.",
        duration: 5000,
        position: "top-center",
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
      <div
        className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${PAC.gray} 0%, #FFF5F5 50%, ${PAC.gray} 100%)`,
        }}
      >
        {/* Motif circulaire en fond */}
        <div
          className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] opacity-[0.06]"
          style={{
            backgroundImage: "url(/motif-pac.png)",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
          }}
        />

        <Card
          className="relative w-full max-w-xl border shadow-2xl rounded-3xl overflow-hidden bg-white/95 backdrop-blur"
          style={{
            borderColor: PAC.grayBorder,
            animation: "fadeInZoom 0.6s ease-out",
          }}
        >
          <div
            className="h-2"
            style={{
              background: `linear-gradient(90deg, ${PAC.red}, ${PAC.black})`,
            }}
          />

          <CardContent className="pt-10 pb-10 px-8 text-center">
            <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ backgroundColor: PAC.redLight }}
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: PAC.redLight }}
              />
              <div
                className="relative flex h-20 w-20 items-center justify-center rounded-full shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${PAC.red}, ${PAC.redDark})`,
                }}
              >
                <CheckCircle2
                  className="h-11 w-11 text-white"
                  strokeWidth={2}
                />
              </div>
            </div>

            <div
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4"
              style={{ color: PAC.redDark, backgroundColor: PAC.redLight }}
            >
              <PartyPopper className="h-3 w-3" />
              Inscription confirmée
            </div>

            <h2
              className="text-3xl font-bold mb-3 tracking-tight"
              style={{ color: PAC.black }}
            >
              Merci {submittedData?.prenom} !
            </h2>
            <p
              className="mb-8 leading-relaxed max-w-md mx-auto"
              style={{ color: PAC.blackSoft }}
            >
              Votre inscription a bien été enregistrée. Nous avons hâte de vous
              accueillir à l&apos;événement.
            </p>

            {submittedData && (
              <div
                className="text-left border rounded-2xl p-5 mb-8 space-y-3"
                style={{
                  backgroundColor: PAC.gray,
                  borderColor: PAC.grayBorder,
                }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wide mb-3"
                  style={{ color: PAC.blackSoft }}
                >
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
                  value={format(
                    new Date(submittedData.date_participation),
                    "dd MMMM yyyy",
                    { locale: fr },
                  )}
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
              className="rounded-xl px-8 h-12 font-semibold shadow-lg transition-all hover:-translate-y-0.5 text-white"
              style={{ backgroundColor: PAC.black }}
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Nouvelle inscription
            </Button>

            <p
              className="flex items-center justify-center gap-1.5 text-xs mt-6"
              style={{ color: PAC.blackSoft }}
            >
              <ShieldCheck className="h-3.5 w-3.5" style={{ color: PAC.red }} />
              Vos données sont traitées de manière confidentielle
            </p>
          </CardContent>
        </Card>

        {/* Animation keyframes */}
        <style jsx global>{`
          @keyframes fadeInZoom {
            from {
              opacity: 0;
              transform: scale(0.92) translateY(12px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  /* ============================================================
     FORMULAIRE
  ============================================================ */
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${PAC.gray} 0%, #FFF5F5 50%, ${PAC.gray} 100%)`,
      }}
    >
      {/* Motif circulaire décoratif en arrière-plan */}
      <div
        className="pointer-events-none absolute -top-60 -right-60 h-[700px] w-[700px] opacity-[0.2]"
        style={{
          backgroundImage: "url(/motif-pac.png)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-60 -left-60 h-[700px] w-[700px] opacity-[0.2]"
        style={{
          backgroundImage: "url(/motif-pac.png)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="relative px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-2xl">
          {/* ============ EN-TÊTE AVEC LOGO PAC ============ */}
          <div className="text-center mb-10">
            {/* Logo PAC — centré */}
            <div className="flex justify-center mb-6">
              <div>
                <Image
                  src="/logo-pac.png"
                  alt="Logo PAC"
                  width={200}
                  height={100}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <h1
              className="text-3xl font-bold sm:text-4xl mb-3 tracking-tight"
              style={{ color: PAC.black }}
            >
              Inscription à l&apos;événement
            </h1>
            <p
              className="text-base sm:text-lg max-w-md mx-auto"
              style={{ color: PAC.blackSoft }}
            >
              Renseignez vos informations pour confirmer votre participation
            </p>
          </div>

          {/* ============ CARTE FORMULAIRE ============ */}
          <Card
            className="border shadow-2xl rounded-3xl overflow-hidden bg-white/95 backdrop-blur"
            style={{ borderColor: PAC.grayBorder }}
          >
            {/* Bandeau haut rouge → noir */}
            <div
              className="h-2"
              style={{
                background: `linear-gradient(90deg, ${PAC.red}, ${PAC.black})`,
              }}
            />

            <CardHeader
              className="pb-5 border-b"
              style={{ borderColor: PAC.grayBorder }}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle
                    className="text-xl font-semibold"
                    style={{ color: PAC.black }}
                  >
                    Formulaire de renseignement
                  </CardTitle>
                  <CardDescription
                    className="mt-1"
                    style={{ color: PAC.blackSoft }}
                  >
                    Les champs marqués d&apos;un{" "}
                    <span style={{ color: PAC.red }} className="font-medium">
                      *
                    </span>{" "}
                    sont obligatoires
                  </CardDescription>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ color: PAC.blackSoft, backgroundColor: PAC.gray }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: PAC.red }}
                  />
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
                  <FormField
                    label="Prénom"
                    required
                    error={errors.prenom?.message}
                    icon={<User className="h-4 w-4" />}
                  >
                    <InputWithIcon icon={<User className="h-4 w-4" />}>
                      <Input
                        {...register("prenom")}
                        placeholder="Votre prénom"
                        className="rounded-xl h-11 pl-10 transition-all"
                        style={{
                          borderColor: PAC.grayBorder,
                          backgroundColor: PAC.gray,
                        }}
                      />
                    </InputWithIcon>
                  </FormField>

                  <FormField
                    label="Nom"
                    required
                    error={errors.nom?.message}
                    icon={<User className="h-4 w-4" />}
                  >
                    <InputWithIcon icon={<User className="h-4 w-4" />}>
                      <Input
                        {...register("nom")}
                        placeholder="Votre nom"
                        className="rounded-xl h-11 pl-10 transition-all"
                        style={{
                          borderColor: PAC.grayBorder,
                          backgroundColor: PAC.gray,
                        }}
                      />
                    </InputWithIcon>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    label="Entreprise"
                    required
                    error={errors.entreprise?.message}
                    icon={<Building2 className="h-4 w-4" />}
                  >
                    <InputWithIcon icon={<Building2 className="h-4 w-4" />}>
                      <Input
                        {...register("entreprise")}
                        placeholder="Nom de l'entreprise"
                        className="rounded-xl h-11 pl-10 transition-all"
                        style={{
                          borderColor: PAC.grayBorder,
                          backgroundColor: PAC.gray,
                        }}
                      />
                    </InputWithIcon>
                  </FormField>

                  <FormField
                    label="Poste occupé"
                    required
                    error={errors.poste?.message}
                    icon={<Briefcase className="h-4 w-4" />}
                  >
                    <InputWithIcon icon={<Briefcase className="h-4 w-4" />}>
                      <Input
                        {...register("poste")}
                        placeholder="Votre poste"
                        className="rounded-xl h-11 pl-10 transition-all"
                        style={{
                          borderColor: PAC.grayBorder,
                          backgroundColor: PAC.gray,
                        }}
                      />
                    </InputWithIcon>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    label="Email"
                    error={errors.email?.message}
                    icon={<Mail className="h-4 w-4" />}
                    optional
                  >
                    <InputWithIcon icon={<Mail className="h-4 w-4" />}>
                      <Input
                        type="email"
                        {...register("email")}
                        placeholder="exemple@email.com"
                        className="rounded-xl h-11 pl-10 transition-all"
                        style={{
                          borderColor: PAC.grayBorder,
                          backgroundColor: PAC.gray,
                        }}
                      />
                    </InputWithIcon>
                  </FormField>

                                  {/* PAYS avec drapeaux */}
                <FormField
                  label="Pays"
                  required
                  error={errors.pays?.message}
                  icon={<Globe className="h-4 w-4" />}
                >
                  <Controller
                    name="pays"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={countryOptions}
                        value={
                          countryOptions.find((o) => o.value === field.value) ||
                          null
                        }
                        onChange={(opt: any) =>
                          field.onChange(opt?.value || "")
                        }
                        placeholder="Sélectionnez votre pays"
                        isSearchable
                        formatOptionLabel={(opt: any) => (
                          <div className="flex items-center gap-2">
                            {opt.flag && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`https://flagcdn.com/20x15/${opt.flag.toLowerCase()}.png`}
                                alt={opt.value}
                                width={20}
                                height={15}
                                className="inline-block rounded-sm shadow-sm"
                              />
                            )}
                            <span>
                              {opt.value}{" "}
                              <span style={{ color: PAC.blackSoft }}>
                                ({opt.code})
                              </span>
                            </span>
                          </div>
                        )}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            minHeight: "2.75rem",
                            border: state.isFocused
                              ? `1px solid ${PAC.red}`
                              : `1px solid ${PAC.grayBorder}`,
                            borderRadius: "0.75rem",
                            padding: "0 0.25rem",
                            fontSize: "1rem",
                            backgroundColor: state.isFocused
                              ? "white"
                              : PAC.gray,
                            boxShadow: state.isFocused
                              ? `0 0 0 4px rgba(214, 40, 40, 0.12)`
                              : "none",
                            "&:hover": { borderColor: PAC.red },
                            transition: "all 0.2s",
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected
                              ? PAC.red
                              : state.isFocused
                                ? PAC.redLight
                                : "white",
                            color: state.isSelected ? "white" : PAC.black,
                            fontSize: "0.95rem",
                            padding: "0.6rem 1rem",
                            cursor: "pointer",
                          }),
                          menu: (base) => ({
                            ...base,
                            borderRadius: "0.75rem",
                            overflow: "hidden",
                            boxShadow: "0 10px 40px rgba(15,23,42,0.12)",
                            border: `1px solid ${PAC.grayBorder}`,
                          }),
                          placeholder: (base) => ({
                            ...base,
                            color: "#94a3b8",
                          }),
                        }}
                      />
                    )}
                  />
                </FormField>

                  <FormField
                    label="Téléphone"
                    error={errors.telephone?.message}
                    icon={<Phone className="h-4 w-4" />}
                    optional
                  >
                    <div
                      className="flex items-stretch rounded-xl border overflow-hidden transition-all h-11"
                      style={{
                        borderColor: PAC.grayBorder,
                        backgroundColor: PAC.gray,
                      }}
                    >
                      <span
                        className="flex items-center gap-1.5 px-3 text-sm font-medium tabular-nums border-r"
                        style={{
                          backgroundColor: "#EDEDED",
                          borderColor: PAC.grayBorder,
                          color: PAC.blackSoft,
                        }}
                      >
                        <Phone
                          className="h-3.5 w-3.5"
                          style={{ color: PAC.blackSoft }}
                        />
                        {dialCode || "+..."}
                      </span>
                      <input
                        type="tel"
                        {...register("telephone")}
                        placeholder="6 12 34 56 78"
                        className="flex-1 px-3 outline-none text-base bg-transparent"
                      />
                    </div>
                  </FormField>
                </div>

                {/* SECTION 2 */}
                <div className="pt-2">
                  <SectionTitle
                    number="02"
                    title="Votre participation"
                    subtitle="Date et thématique souhaitée"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    label="Date de participation"
                    required
                    error={errors.date_participation?.message}
                    icon={<CalendarIcon className="h-4 w-4" />}
                  >
                    <Popover
                      open={datePickerOpen}
                      onOpenChange={setDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal rounded-xl h-11 transition-all",
                            !watchedDate && "text-slate-400",
                          )}
                          style={{
                            borderColor: PAC.grayBorder,
                            backgroundColor: PAC.gray,
                          }}
                        >
                          <CalendarIcon
                            className="mr-2 h-4 w-4"
                            style={{ color: PAC.blackSoft }}
                          />
                          {watchedDate
                            ? format(new Date(watchedDate), "dd MMMM yyyy", {
                                locale: fr,
                              })
                            : "Sélectionnez une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 rounded-xl"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) {
                              setSelectedDate(date);
                              setValue(
                                "date_participation",
                                format(date, "yyyy-MM-dd"),
                                {
                                  shouldValidate: true,
                                },
                              );
                              setDatePickerOpen(false);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormField>

                  <FormField
                    label="Thématique du panel"
                    required
                    error={errors.thematique_panel?.message}
                    icon={<PanelTop className="h-4 w-4" />}
                  >
                    <InputWithIcon icon={<PanelTop className="h-4 w-4" />}>
                      <Input
                        {...register("thematique_panel")}
                        placeholder="Ex : Intelligence Artificielle..."
                        className="rounded-xl h-11 pl-10 transition-all"
                        style={{
                          borderColor: PAC.grayBorder,
                          backgroundColor: PAC.gray,
                        }}
                      />
                    </InputWithIcon>
                  </FormField>
                </div>

                {/* BOUTON */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="group w-full rounded-xl py-6 text-base font-semibold shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-white"
                    style={{
                      background: `linear-gradient(90deg, ${PAC.red}, ${PAC.redDark}, ${PAC.black})`,
                      boxShadow: `0 10px 30px rgba(214, 40, 40, 0.25)`,
                    }}
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

                <div
                  className="flex items-center justify-center gap-2 text-xs pt-1"
                  style={{ color: PAC.blackSoft }}
                >
                  <ShieldCheck
                    className="h-3.5 w-3.5"
                    style={{ color: PAC.red }}
                  />
                  <span>
                    Vos données sont traitées de manière confidentielle et
                    sécurisée
                  </span>
                </div>
              </form>
            </CardContent>
          </Card>

          <p
            className="text-center text-xs mt-6"
            style={{ color: PAC.blackSoft }}
          >
            Besoin d&apos;aide ? Contactez l&apos;équipe organisatrice.
          </p>
        </div>
      </div>
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
    <div
      className="flex items-start gap-4 pb-4 border-b"
      style={{ borderColor: PAC.grayBorder }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm text-white"
        style={{
          background: `linear-gradient(135deg, ${PAC.red}, ${PAC.black})`,
        }}
      >
        {number}
      </div>
      <div>
        <h3 className="text-base font-semibold" style={{ color: PAC.black }}>
          {title}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: PAC.blackSoft }}>
          {subtitle}
        </p>
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
      <Label
        className="text-sm font-medium flex items-center gap-1.5"
        style={{ color: PAC.black }}
      >
        <span style={{ color: PAC.blackSoft }}>{icon}</span>
        {label}
        {required && <span style={{ color: PAC.red }}>*</span>}
        {optional && (
          <span
            className="text-xs font-normal"
            style={{ color: PAC.blackSoft }}
          >
            (optionnel)
          </span>
        )}
      </Label>
      {children}
      {error && (
        <p
          className="text-xs flex items-center gap-1"
          style={{ color: PAC.red }}
        >
          <span
            className="inline-block h-1 w-1 rounded-full"
            style={{ backgroundColor: PAC.red }}
          />
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
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-10"
        style={{ color: PAC.blackSoft }}
      >
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
      <div
        className="flex items-center gap-2.5 text-sm"
        style={{ color: PAC.blackSoft }}
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border"
          style={{ borderColor: PAC.grayBorder, color: PAC.blackSoft }}
        >
          {icon}
        </span>
        {label}
      </div>
      <span
        className="text-sm font-semibold text-right truncate max-w-[60%]"
        style={{ color: PAC.black }}
      >
        {value}
      </span>
    </div>
  );
}