import { browser } from 'protractor';

import * as support from './support';
import { FeatureLevelUtils } from './support/feature_level';
import { Quickstart } from './support/quickstart';
import { DeploymentsInteractions, DeploymentsInteractionsFactory } from './interactions/deployments_interactions';
import { LoginInteraction } from './interactions/login_interactions';
import { PipelinesInteractionsFactory } from './interactions/pipelines_interactions';
import { SpaceDashboardInteractionsFactory } from './interactions/space_dashboard_interactions';
import { AccountHomeInteractionsFactory } from './interactions/account_home_interactions';
import { SpaceCheWorkspacePage } from './page_objects/space_cheworkspace.page';
import { Button } from './ui/button';
import { PageOpenMode } from './page_objects/base.page';
import { CodebasesInteractionsFactory } from './interactions/codebases_interactions';

describe('e2e_smoketest', () => {

  let quickstart: Quickstart;
  let strategy: string;
  let spaceName: string;

  beforeAll(async () => {
    support.info('--- Before all ---');
    await support.desktopTestSetup();
    spaceName = support.newSpaceName();
    strategy = browser.params.release.strategy;
    quickstart = new Quickstart(browser.params.quickstart.name);
  });

  beforeEach(async() => {
    support.screenshotManager.nextTest();
  });

  afterEach(async () => {
    support.info('--- After each ---');
    await support.screenshotManager.writeScreenshot('afterEach');
  });

  afterAll(async () => {
    support.info('--- After all ---');
    if (browser.params.reset.environment === 'true') {
      try {
        support.info('--- Reset environment ---');
        let accountHomeInteractions = AccountHomeInteractionsFactory.create();
        await accountHomeInteractions.resetEnvironment();
      } catch (e) {
        await support.screenshotManager.writeScreenshot('resetEnvironment');
        throw e;
      }
    }
  });

  it('login', async () => {
    support.info('--- Login ---');
    let login = new LoginInteraction();
    await login.run();
  });

  it('feature_level', async () => {
    support.info('--- Check if feature level is set correctly ---');
    let featureLevel = await FeatureLevelUtils.getRealFeatureLevel();
    expect(featureLevel).toBe(FeatureLevelUtils.getConfiguredFeatureLevel(), 'feature level');
  });

  it('create_space_new_codebase', async () => {
    support.info('--- Create space with new codebase ' + spaceName + ' ---');
    let accountHomeInteractions = AccountHomeInteractionsFactory.create();
    await accountHomeInteractions.createSpaceWithNewCodebase(spaceName, quickstart.name, strategy);
  });

  it('run_che', async () => {
    support.info('--- Run che workspace ' + quickstart.name + ' ---');
    let codebasesInteractions = CodebasesInteractionsFactory.create(strategy, spaceName);
    await codebasesInteractions.openCodebasesPage(PageOpenMode.UseMenu);
    await codebasesInteractions.createAndOpenWorkspace();

    let spaceCheWorkSpacePage = new SpaceCheWorkspacePage();
    let projectInCheTree = new Button(spaceCheWorkSpacePage.recentProjectRootByName(spaceName), 'Project in Che Tree');
    await projectInCheTree.untilPresent(support.LONGEST_WAIT);
    expect(await spaceCheWorkSpacePage.recentProjectRootByName(spaceName).getText()).toContain(spaceName);

    /* Switch back to the OSIO browser window */
    await support.windowManager.switchToMainWindow();
    let workspaces = await codebasesInteractions.getWorkspaces();
    expect(workspaces.length).toBe(1);
  });

  it('pipeline', async () => {
    support.info('--- Run pipeline ---');
    let pipelineInteractions = PipelinesInteractionsFactory.create(strategy, spaceName);
    await pipelineInteractions.openPipelinesPage(PageOpenMode.UseMenu);
    let pipeline = await pipelineInteractions.verifyBuildInfo();
    await pipelineInteractions.waitToFinish(pipeline);
    await pipelineInteractions.verifyBuildResult(pipeline);
    await pipelineInteractions.verifyBuildStages(pipeline);
  });

  it('deployments', async () => {
    support.info('--- Verify deployments ---');
    let deploymentsInteractions: DeploymentsInteractions = DeploymentsInteractionsFactory.create(strategy, spaceName);
    await deploymentsInteractions.openDeploymentsPage(PageOpenMode.UseMenu);
    let application = await deploymentsInteractions.verifyApplication();
    await deploymentsInteractions.verifyEnvironments(application);
    await deploymentsInteractions.verifyResourceUsage();
  });

  it('dashboard', async () => {
    support.info('--- Verify dashboard ---');
    let dashboardInteractions = SpaceDashboardInteractionsFactory.create(strategy, spaceName);
    await dashboardInteractions.openSpaceDashboardPage(PageOpenMode.UseMenu);
    await dashboardInteractions.verifyCodebases();
    await dashboardInteractions.verifyAnalytics();
    await dashboardInteractions.verifyApplications();
    await dashboardInteractions.verifyWorkItems();
  });
});
