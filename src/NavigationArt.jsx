const assets={dashboard:'home',library:'library',review_today:'review',exams:'exams',annals:'annals',planning:'planning',progress:'progress',account:'account',history:'history',tutor:'tutor',interview_config:'oral'};
export default function NavigationArt({screen}) {
  const asset=assets[screen];
  return asset?<img className="g-nav-art" src={(['history','tutor','interview_config'].includes(screen)?'/navigation-3d-v2/':'/navigation-3d-v1/')+asset+'.webp'} alt="" aria-hidden="true" width="40" height="40" decoding="async"/>:null;
}
