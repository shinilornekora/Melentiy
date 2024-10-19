const { callNeuralHelp } = require('../utils/neuro');
const { getProjectArch, getProjectName, getProjectDeps } = require('../utils/neuro_scripts');

const TEST_IDEA = `
    I wanna create an app that allows the users to book hotel things (something like tourfirma system.)
    That will be project with animations, so take care of it. As for state manager... Maybe something like MobX or Effector will do.
`

const TEST_IDEA_WITHOUT_TECHNO = `
    I wanna create an app that allows the users to book hotel things (something like tourfirma system.)
    That will be project with animations, so take care of it. As for state manager... Maybe something like MobX or Effector will do.
`

async function makeTestRequest() {
    // const arch = await getProjectArch(TEST_IDEA);
    // const name = await getProjectName(TEST_IDEA);
    const deps = await getProjectDeps(TEST_IDEA_WITHOUT_TECHNO);

    console.log(deps)
}

makeTestRequest()

module.exports = {
    makeTestRequest
}