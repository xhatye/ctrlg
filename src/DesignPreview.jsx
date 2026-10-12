// Development-only route. No real user account, payment or Firestore write.
import { useState } from "react";
import {
  Marketing,
  StudentHome,
  ProductShell,
  CourseHome,
  OfferPage,
  AccountPage,
  TutorPage,
  LibraryPage,
  LearningProgress,
  PublicInfo,
} from "./modern";
import {
  DCG_UES,
  DSCG_UES,
  QCMScreen,
  FlashcardsScreen,
  PlanningScreen,
  ResumeCoursScreen,
  CasPratiqueScreen,
  Auth,
  InterviewConfig,
} from "./App";
const ues = [...DCG_UES, ...DSCG_UES];
const student = {
  name: "Camille Martin",
  email: "apercu@example.fr",
  isPro: true,
  proType: "subscription",
  streak: 4,
  history: [
    { type: "qcm", ue: "UE9", score: 7, total: 10, duration: 310 },
    { type: "qcm", ue: "UE4", score: 8, total: 10, duration: 400 },
  ],
  mastery: { UE9: { best: 70, attempts: 2 }, UE4: { best: 80, attempts: 3 } },
};
export default function DesignPreview() {
  const [page, setPage] = useState(
      new URLSearchParams(location.search).get("design") || "landing",
    ),
    [ue, setUE] = useState(ues.find((x) => x.id === "UE9"));
  const nav = (key) => {
    setPage(key);
    history.replaceState({}, "", `/?design=${key}`);
  };
  const select = (ue) => {
    setUE(ue);
    nav("subject_hub");
  };
  const content =
    page === "landing" ? (
      <Marketing onAuth={() => nav("auth")} onNav={nav} ues={ues} />
    ) : page === "pricing" ? (
      <OfferPage user={student} onCheckout={() => nav("account")} onNav={nav} />
    ) : page === "library" ? (
      <LibraryPage ues={ues} user={student} onSelect={select} />
    ) : page === "subject_hub" ? (
      <CourseHome ue={ue} user={student} onNav={nav} />
    ) : page === "account" ? (
      <AccountPage
        user={student}
        onNav={nav}
        onCheckout={() => nav("pricing")}
        request={async () => ({
          isPro: true,
          message: "Aperçu : aucun paiement réel vérifié.",
        })}
      />
    ) : page === "progress" ? (
      <LearningProgress user={student} ues={ues} onNav={nav} />
    ) : page === "tutor" ? (
      <TutorPage
        ues={ues}
        user={student}
        call={async () =>
          "Aperçu de design : une explication pédagogique apparaît ici. Aucun appel IA réel n’a été effectué."
        }
      />
    ) : page === "planning" ? (
      <PlanningScreen
        user={student}
        onBack={() => nav("dashboard")}
        onUpgrade={() => nav("pricing")}
      />
    ) : page === "interview_config" ? (
      <InterviewConfig
        user={student}
        onStart={() => nav("tutor")}
        onBack={() => nav("dashboard")}
      />
    ) : page === "qcm" ? (
      <QCMScreen
        ue={ue}
        user={student}
        onDone={() => nav("progress")}
        onBack={() => nav("subject_hub")}
      />
    ) : page === "flashcards" ? (
      <FlashcardsScreen
        ue={ue}
        user={student}
        onBack={() => nav("subject_hub")}
        onUpgrade={() => nav("pricing")}
      />
    ) : page === "resume_cours" ? (
      <ResumeCoursScreen
        ue={ue}
        user={student}
        onBack={() => nav("subject_hub")}
      />
    ) : page === "cas_pratique" ? (
      <CasPratiqueScreen
        ue={ue}
        user={student}
        onDone={() => nav("progress")}
        onBack={() => nav("subject_hub")}
      />
    ) : page === "auth" ? (
      <Auth
        mode="login"
        setMode={() => {}}
        onDone={() => nav("dashboard")}
        onBack={() => nav("landing")}
      />
    ) : ["features", "dcg", "dscg", "resources", "support"].includes(page) ? (
      <PublicInfo
        page={page}
        onNav={nav}
        onAuth={() => nav("auth")}
        ues={ues}
      />
    ) : (
      <StudentHome user={student} ues={ues} onNav={nav} onSelect={select} />
    );
  const isPublic = [
    "landing",
    "pricing",
    "auth",
    "features",
    "dcg",
    "dscg",
    "resources",
    "support",
  ].includes(page);
  return (
    <>
      <div className="design-preview-banner">
        Aperçu de design · données illustratives · paiements désactivés{" "}
        <button onClick={() => nav("landing")}>Accueil</button>
        <button onClick={() => nav("dashboard")}>Espace étudiant</button>
      </div>
      {isPublic ? (
        content
      ) : (
        <ProductShell
          user={student}
          screen={page}
          onNav={nav}
          onLogout={() => nav("landing")}
        >
          {content}
        </ProductShell>
      )}
    </>
  );
}
