// Development-only route. No real user account, payment or Firestore write.
import { useState } from "react";
import {applyLearningEvent} from '../lib/learning-progress.mjs';
import { OralPractice, OralSummary } from "./study";
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
  Auth, ResultsQCM, History, LegalScreen, ForgotPasswordScreen, OnboardingModal,
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
  const [learning,setLearning]=useState({chapters:{}});
  const onLearning=async events=>setLearning(old=>events.reduce((p,e)=>applyLearningEvent(p,e,Date.now()),old));
  const [page, setPage] = useState(
      new URLSearchParams(location.search).get("design") || "landing",
    ),
    [ue, setUE] = useState(ues.find((x) => x.id === "UE9"));
  const nav = (key,opts={}) => {
    if(opts.chapter)setUE(ue=>({...ue,chapter:opts.chapter}));
    setPage(key);
    history.replaceState({}, "", `/?design=${key}`);
  };
  const select = (ue) => {
    setUE(ue);
    nav("subject_hub");
  };
  const content =
    page === "results_qcm" ? <ResultsQCM data={{score:1,total:2,duration:55,ue:'UE9',ueName:'Comptabilité',answers:[{correct:true,q:'Une écriture équilibrée',expl:'Le débit égale le crédit.'},{correct:false,q:'Une charge est-elle un actif ?',right:'Non',expl:'Une charge affecte le résultat.'}]}} onNew={()=>nav('qcm')} onDash={()=>nav('dashboard')} /> :
    page === "history" ? <History user={student} onBack={()=>nav('dashboard')} /> :
    page === "onboarding" ? <><StudentHome user={student} ues={ues} onNav={nav} onSelect={select} /><OnboardingModal onClose={()=>nav('dashboard')} onUpgrade={()=>nav('pricing')} /></> :
    page === "interview" ? <OralPractice cfg={{topic:'Comptabilité',difficulty:'Débutant'}} onBack={()=>nav('interview_config')} onDone={()=>nav('oral_summary')} /> :
    page === "oral_summary" ? <OralSummary data={{topic:'Comptabilité',answers:[],duration:55}} onBack={()=>nav('dashboard')} /> :
    page === "forgot_password" ? <ForgotPasswordScreen onBack={()=>nav('auth')} /> :
    ["cgu","confidentialite"].includes(page) ? <LegalScreen type={page} onBack={()=>nav('landing')} /> :
    page === "landing" ? (
      <Marketing onAuth={() => nav("auth")} onNav={nav} ues={ues} />
    ) : page === "pricing" ? (
      <OfferPage user={student} onCheckout={() => nav("account")} onNav={nav} />
    ) : page === "library" ? (
      <LibraryPage ues={ues} user={student} onSelect={select} />
    ) : page === "subject_hub" ? (
      <CourseHome ue={ue} user={student} onNav={nav} learning={learning}/>
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
      <LearningProgress user={student} ues={ues} onNav={nav} learning={learning} onOpen={(ue,chapter,target)=>{setUE({...ue,chapter});nav(target);}} />
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
        ues={ues}
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
        onDone={async data=>{const groups={};for(const a of data.answers){const g=groups[a.chapter] ||= {total:0,correct:0};g.total++;if(a.correct)g.correct++;}await onLearning(Object.entries(groups).map(([chapter,g])=>({type:'quiz',module:ue.id,chapter,...g})));nav("progress");}}
        onBack={() => nav("subject_hub")}
      />
    ) : page === "flashcards" ? (
      <FlashcardsScreen
        ue={ue}
        user={student}
        onLearning={onLearning}
        onBack={() => nav("subject_hub")}
        onUpgrade={() => nav("pricing")}
      />
    ) : page === "resume_cours" ? (
      <ResumeCoursScreen
        ue={ue}
        user={student}
        onLearning={onLearning}
        learning={learning}
        onBack={() => nav("subject_hub")}
      />
    ) : page === "cas_pratique" ? (
      <CasPratiqueScreen
        ue={ue}
        user={student}
        onLearning={onLearning}
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
    "support", "cgu", "confidentialite", "forgot_password",
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
