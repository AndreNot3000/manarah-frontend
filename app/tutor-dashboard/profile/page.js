// Written by Bearilly Buildgram (full codebase swap). A public page of the school's website, kept as designed at /tutor-dashboard/profile.
import '../../../school-site/src/app/globals.css';
import SchoolChrome from '../../../school-site/src/app/layout';
import SchoolPage from '../../../school-site/src/app/(tutor)/tutor-dashboard/profile/page';

export default function SchoolSitePage(props) {
  return (
    <SchoolChrome>
      <SchoolPage {...props} />
    </SchoolChrome>
  );
}
