

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageLockJsonPath = path.resolve(__dirname, '../package-lock.json');

const getPackageJson = () => JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const writePackageJson = (data) => fs.writeFileSync(packageJsonPath, JSON.stringify(data, null, 2) + '\n');

const getPackageLockJson = () => JSON.parse(fs.readFileSync(packageLockJsonPath, 'utf8'));
const writePackageLockJson = (data) => fs.writeFileSync(packageLockJsonPath, JSON.stringify(data, null, 2) + '\n');

async function getNextVersion() {
    const pkg = getPackageJson();
    const packageName = pkg.name;

    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // MM format

    const versionPrefix = `${year}.${month}`;

    let latestPatch = -1;

    try {
        // Get all versions from npm registry
        const versionsOutput = execSync(`npm view ${packageName} versions --json`, { encoding: 'utf8' });
        const allVersions = JSON.parse(versionsOutput);

        // Filter for versions matching the current YYYY.MM prefix
        const currentMonthVersions = allVersions.filter(v => v.startsWith(versionPrefix));

        if (currentMonthVersions.length > 0) {
            // Find the highest patch number for the current month
            latestPatch = currentMonthVersions.reduce((maxPatch, version) => {
                const parts = version.split('.');
                const patch = parseInt(parts[2], 10);
                return Math.max(maxPatch, patch);
            }, -1);
        }
    } catch (error) {
        // If package not found or no versions, assume no existing versions for this prefix
        console.warn(`Could not fetch versions for ${packageName} from npm registry. Assuming no existing versions for ${versionPrefix}.`);
        // console.error(error.message); // Uncomment for debugging
    }

    const nextPatch = latestPatch + 1;
    return `${versionPrefix}.${nextPatch}`;
}

async function updateVersion() {
    const nextVersion = await getNextVersion();
    const pkg = getPackageJson();
    const pkgLock = getPackageLockJson();

    console.log(`Setting new version to: ${nextVersion}`);

    pkg.version = nextVersion;
    writePackageJson(pkg);

    // Update version in package-lock.json
    if (pkgLock.version) {
        pkgLock.version = nextVersion;
    }
    // For npm v2/v3 package-lock.json format
    if (pkgLock.packages && pkgLock.packages['']) {
        pkgLock.packages[''].version = nextVersion;
    }
    writePackageLockJson(pkgLock);

    console.log(`Version updated to ${nextVersion} in package.json and package-lock.json`);
}

updateVersion().catch(console.error);

