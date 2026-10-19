const assets={dashboard:'home',library:'library',review_today:'review',exams:'exams',annals:'annals',planning:'planning',progress:'progress',account:'account'};
export default function NavigationArt({screen}) {
  const asset=assets[screen];
  return asset?<img className="g-nav-art" src={'/navigation-3d-v1/'+asset+'.webp'} alt="" aria-hidden="true" width="40" height="40" decoding="async"/>:null;
}
