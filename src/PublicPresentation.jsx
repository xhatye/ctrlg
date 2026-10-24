import {RefinedLanding,RefinedFeatures} from './RefinedPublic';
import {PublicStudyNav,PublicStudyFooter} from './PublicStudySite';
import FAQ from './PublicFAQ';
import {curriculumFor} from '../lib/curriculum.mjs';

// Public presentations must not depend on authentication or wait for a user profile.
export default function PublicPresentation({path=globalThis.location?.pathname||'/'}){
 const onNav=key=>{const url={dcg:'/dcg',dscg:'/dscg',pricing:'/tarifs',features:'/fonctionnalites'}[key];if(url)window.location.assign(url);};
 const props={Nav:PublicStudyNav,Footer:PublicStudyFooter,Faq:FAQ,onNav,ues:curriculumFor('2027')};
 return path==='/fonctionnalites'?<RefinedFeatures {...props}/>:<RefinedLanding {...props}/>;
}
