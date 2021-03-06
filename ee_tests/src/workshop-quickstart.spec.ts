import * as support from './support';
import { MainDashboardPage } from './page_objects/main_dashboard.page';
import { LoginInteraction } from './interactions/login_interactions';

describe(' new spaces in OSIO', () => {
  let mainDashboard: MainDashboardPage;

  beforeEach( async () => {
    await support.desktopTestSetup();
    let login = new LoginInteraction();
    await login.run();
    mainDashboard = new MainDashboardPage();
  });

  it('Create a new quickstart', async () => {
    let spaceName = support.newSpaceName();
    let spaceDashboard = await mainDashboard.createNewSpace(spaceName);

    // let spaceDashboard = new SpaceDashboardPage(spaceName)
    // await spaceDashboard.open()
    let wizard = await spaceDashboard.addToSpace();

    support.info('Creating a Vert.x HTTP Booster');
    await wizard.newQuickstartProject({
      project: 'Vert.x HTTP Booster'
    });

    await spaceDashboard.ready();
    // TODO: add a verification to check if the quickstart succeeded

  }, support.minutes(5));

});
