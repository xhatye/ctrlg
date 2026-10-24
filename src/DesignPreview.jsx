import FirstSession from './FirstSession';
import SamplePage from './SamplePage';
import AnnalsPreview from './AnnalsLibrary';
// Development-only route. No real user account, payment or Firestore write.
import { useState } from "react";
import AppLoading from './AppLoading';
import catalogue from "./catalogue.json";
import {applyLearningEvent} from '../lib/learning-progress.mjs';
import { OralPractice, OralSummary } from "./study";
import ExamPage from './ExamPage';
import ReviewToday from './ReviewToday';
import FeedbackForm from './FeedbackForm';
import {trainingRequest} from './training-client';
const previewReviews=()=>trainingRequest('feedback').then(data=>data.items);
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
  PublicInfo, StudentReviews,
} from "./modern";
import {
  DCG_UES,
  DSCG_UES,
  QCMScreen,
  FlashcardsScreen,
  PlanningScreen,
  ResumeCoursScreen,
  CasPratiqueScreen,
  Auth, ResultsQCM, ResultsCas, Paywall, History, LegalScreen, ForgotPasswordScreen, OnboardingModal,
  InterviewConfig,
} from "./App";
const ues = [...DCG_UES, ...DSCG_UES];
const demoStudent = {
  uid:'design-preview',
  name: "Camille Martin",
  email: "apercu@example.fr",
  isPro: true,
  proType: "subscription",
  streak: 4,
  history: [
    { type: "qcm", ue: "UE9", score: 7, total: 10, duration: 310, dateISO:new Date().toISOString() },
    { type: "qcm", ue: "UE4", score: 8, total: 10, duration: 400, dateISO:new Date(Date.now()-86400000).toISOString() },
  ],
  mastery: { UE9: { best: 70, attempts: 2 }, UE4: { best: 80, attempts: 3 } },
};
export default function DesignPreview() {
  const previewState = new URLSearchParams(location.search).get('state');
  const [authMode,setAuthMode] = useState(new URLSearchParams(location.search).get('mode') || 'login');
  const [student,setStudent] = useState(()=>previewState==='empty'?{...demoStudent,history:[],mastery:{},streak:0}:{...demoStudent,isPro:previewState!=='free'});
  const [learningError,setLearningError] = useState(previewState==='error');
  const [learning,setLearning]=useState(()=>previewState==='empty'?{chapters:{}}:({chapters:{['UE9/'+catalogue.modules.UE9.chapters[0].id]:{lessonRead:true,quizBest:70,qualifyingQuizBest:70,quizAttempts:1,lastActivityAt:new Date().toISOString()}}}));
  const onLearning=async events=>setLearning(old=>events.reduce((p,e)=>applyLearningEvent(p,e,Date.now()),old));
  const [page, setPage] = useState(
      new URLSearchParams(location.search).get("design") || "landing",
    ),
    [ue, setUE] = useState(()=>{const params=new URLSearchParams(location.search);return {...(ues.find(x=>x.id===params.get('ue')) || ues.find(x=>x.id==='UE9')),chapter:params.get('chapter') || undefined};});
  if (page === 'loading') return <AppLoading />;
  const nav = (key,opts={}) => {
    if (["login","signup"].includes(opts.authMode)) setAuthMode(opts.authMode);
    if(opts.module)setUE({...ues.find(u=>u.id===opts.module),chapter:opts.chapter});
    else if(opts.chapter)setUE(ue=>({...ue,chapter:opts.chapter}));
    setPage(key);
    history.replaceState({}, "", `/?design=${key}${opts.module?"&ue="+opts.module:""}${opts.chapter?"&chapter="+encodeURIComponent(opts.chapter):""}${opts.format?"&format="+opts.format:""}`);
  };
  const select = (ue) => {
    setUE(ue);
    nav("subject_hub");
  };
  const content =
    page === "annals" ? <AnnalsPreview user={student} onNav={nav}/> :
    page === "testimonials" ? <StudentReviews load={previewReviews} onNav={nav}/> :
    page === "paywall" ? <Paywall onUpgrade={()=>nav('pricing')} onBack={()=>nav('dashboard')}/> :
    page === "results_cas" ? <ResultsCas data={{ue:'UE9',duration:0,evaluation:null}} onDash={()=>nav('history')}/> :
    page === "results_qcm" ? <ResultsQCM data={{score:1,total:2,duration:55,ue:'UE9',ueName:'Comptabilité',answers:[{correct:true,q:'Une écriture équilibrée',expl:'Le débit égale le crédit.'},{correct:false,q:'Une charge est-elle un actif ?',right:'Non',expl:'Une charge affecte le résultat.'}]}} onNew={()=>nav('qcm')} onDash={()=>nav('dashboard')} /> :
    page === "exams" ? <ExamPage user={student} ues={ues} onOpen={(module,chapter,target)=>{setUE({...ues.find(u=>u.id===module),chapter});nav(target);}}/> :
    page === "review_today" ? <ReviewToday onExams={()=>nav('exams')} onOpen={(module,chapter,target)=>{setUE({...ues.find(u=>u.id===module),chapter});nav(target);}}/> :
    page === "feedback" ? <FeedbackForm/> :
    page === "history" ? <History user={student} onBack={()=>nav('dashboard')} /> :
    page === "onboarding" ? <><StudentHome user={student} ues={ues} onNav={nav} onSelect={select} learning={learning} learningError={learningError} learningLoading={previewState==='loading'} onRetry={()=>setLearningError(false)} onOpen={(ue,chapter,target)=>{setUE({...ue,chapter});nav(target);}} /><OnboardingModal onClose={()=>nav('dashboard')} onUpgrade={()=>nav('pricing')} /></> :
    page === "interview" ? <OralPractice cfg={{topic:'Comptabilité',difficulty:'Débutant'}} onBack={()=>nav('interview_config')} onDone={()=>nav('oral_summary')} /> :
    page === "oral_summary" ? <OralSummary data={{topic:'Comptabilité',answers:[],duration:55}} onBack={()=>nav('dashboard')} /> :
    page === "forgot_password" ? <ForgotPasswordScreen onBack={()=>nav('auth')} /> :
    ["cgu","confidentialite"].includes(page) ? <LegalScreen type={page} onBack={()=>nav('landing')} /> :
    page === "sample" ? <SamplePage/> : page === "first_session" ? <FirstSession user={student} ues={ues} onNav={nav} onComplete={async data=>{const events=data.answers.map((a,i)=>({receipt:data.sessionId+'_review_'+i,kind:'quiz',itemId:a.itemId,selected:a.selected}));await trainingRequest('review',{events});await onLearning([{id:data.sessionId+'_0',module:data.ue,chapter:data.answers[0].chapter,type:'quiz',total:data.total,correct:data.score}]);setStudent(old=>({...old,history:[...old.history,{...data,type:'qcm',dateISO:new Date().toISOString()}]}));return {...data,historySaved:true};}}/> : page === "landing" ? (
      <Marketing onAuth={mode=>{setAuthMode(mode || "login");nav("auth");}} onNav={nav} ues={ues} />
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
      <LearningProgress user={student} ues={ues} onNav={nav} learning={learning} learningError={learningError} learningLoading={previewState==='loading'} onRetry={()=>setLearningError(false)} onOpen={(ue,chapter,target)=>{setUE({...ue,chapter});nav(target);}} />
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
      <QCMScreen onNav={nav}
        ue={ue}
        user={student}
        onDone={async data=>{setStudent(old=>({...old,history:[...old.history,{type:"qcm",ue:ue.id,score:data.score,total:data.total,duration:data.duration,dateISO:new Date().toISOString()}]}));const groups={};for(const a of data.answers){const g=groups[a.chapter] ||= {total:0,correct:0};g.total++;if(a.correct)g.correct++;}await onLearning(Object.entries(groups).map(([chapter,g])=>({type:'quiz',module:ue.id,chapter,...g})));nav("progress");}}
        onBack={() => nav("subject_hub")}
      />
    ) : page === "flashcards" ? (
      <FlashcardsScreen onNav={nav}
        ue={ue}
        user={student}
        onLearning={onLearning}
        onBack={() => nav("subject_hub")}
        onUpgrade={() => nav("pricing")}
      />
    ) : page === "resume_cours" ? (
      <ResumeCoursScreen
        onNav={nav}
        ue={ue}
        user={student}
        onLearning={onLearning}
        learning={learning}
        onBack={() => nav("subject_hub")}
      />
    ) : page === "cas_pratique" ? (
      <CasPratiqueScreen onNav={nav}
        ue={ue}
        user={student}
        onLearning={onLearning}
        onDone={() => nav("progress")}
        onBack={() => nav("subject_hub")}
      />
    ) : page === "auth" ? (
      <Auth
        onForgot={()=>nav("forgot_password")}
        mode={authMode}
        setMode={setAuthMode}
        onDone={() => nav("dashboard")}
        onBack={() => nav("landing")}
      />
    ) : ["features", "dcg", "dscg", "resources", "support"].includes(page) ? (
      <PublicInfo
        page={page}
        onNav={nav}
        onAuth={mode=>{setAuthMode(mode || "login");nav("auth");}}
        ues={ues}
      />
    ) : (
      <StudentHome user={student} ues={ues} onNav={nav} onSelect={select} learning={learning} learningError={learningError} learningLoading={previewState==='loading'} onRetry={()=>setLearningError(false)} onOpen={(ue,chapter,target)=>{setUE({...ue,chapter});nav(target);}} />
    );
  const isPublic = [
    "sample", "landing",
    "pricing",
    "auth",
    "features",
    "dcg",
    "dscg",
    "resources",
    "support", "testimonials", "cgu", "confidentialite", "forgot_password",
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
          variant={page === 'dashboard' ? 'gizmo' : undefined}
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
