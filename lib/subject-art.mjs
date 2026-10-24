// Subject families share the same original purple/mint 3D art across public and student views.
const generated=name=>'/subjects-3d-v1/'+name+'.webp';
const navigation=name=>'/navigation-3d-v1/'+name+'.webp';
export const SUBJECT_ART={
 UE1:generated('law'),UE2:generated('law'),UE3:generated('law'),UE4:generated('finance'),
 UE5:navigation('progress'),UE6:generated('finance'),UE7:navigation('progress'),UE8:generated('systems'),
 UE9:generated('finance'),UE10:navigation('library'),UE11:navigation('progress'),UE12:generated('language'),UE13:generated('language'),
 DSCG1:generated('law'),DSCG2:generated('finance'),DSCG3:navigation('progress'),DSCG4:navigation('library'),
 DSCG5:generated('systems'),DSCG6:generated('language'),DSCG7:navigation('account'),
};
export const subjectArt=id=>SUBJECT_ART[id] || SUBJECT_ART.UE9;
