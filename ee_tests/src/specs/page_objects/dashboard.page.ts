import { browser, ExpectedConditions as until, $ } from 'protractor';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  appTag = $('f8-app');

  async validate() {
    await browser.wait(until.presenceOf(this.appTag));
  }

}


