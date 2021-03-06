from behave import when, then
from features.src.resetEnv import ResetEnvironment
from pyshould import should


@when(u'I reset environment')
def when_reset_environment(_context):
    global resetEnv
    resetEnv = ResetEnvironment()
    resetEnv.removeSpaces()
    resetEnv.cleanTenant()


@then(u'I should see clean environment')
def then_clean_environment(_context):
    global resetEnv
    len(resetEnv.getSpaces()) | should.equal(0).described_as(
        "Number of spaces after environment reset."
    )
