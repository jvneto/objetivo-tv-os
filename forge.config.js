const path = require('path');
const fs = require('fs');
const packageJson = require('./package.json');

const { version, isBeta } = packageJson;
const iconDir = path.resolve(__dirname, 'assets', 'icons');

if (process.env['WINDOWS_CODESIGN_FILE']) {
    const certPath = path.join(__dirname, 'win-certificate.pfx');
    const certExists = fs.existsSync(certPath);

    if (certExists) {
        process.env['WINDOWS_CODESIGN_FILE'] = certPath;
    }
}

const commonLinuxConfig = {
    icon: {
        scalable: path.resolve(iconDir, 'objetivo.svg'),
    },
    mimeType: ['x-scheme-handler/objetivo'],
};

const config = {
    packagerConfig: {
        name: 'objetivo_tv_os',
        executableName: 'Objetivo TV OS',
        asar: true,
        icon: path.resolve(__dirname, 'assets', 'icons', 'objetivo'),
        appBundleId: 'com.objetivo.tv_os',
        usageDescription: {},
        appCategoryType: 'public.app-category.developer-tools',
        protocols: [],
        win32metadata: {
            CompanyName: 'Objetivo',
            OriginalFilename: 'Objetivo',
        },
        osxSign: {
            identity: 'Developer ID Application: Julio Cesar Vera Neto (5UQ7TRCVCT)',
            hardenedRuntime: true,
            'gatekeeper-assess': false,
            entitlements: 'entitlements.plist',
            'entitlements-inherit': 'entitlements.plist',
            'signature-flags': 'library',
        },
    },
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            platforms: ['win32'],
            config: (arch) => ({
                name: 'Objetivo TV OS',
                authors: 'Objetivo',
                exe: 'objetivo_tv_os.exe',
                iconUrl: path.resolve(iconDir, 'objetivo.ico'),
                loadingGif: '',
                noMsi: true,
                setupExe: `objetivo-tv-os-${version}${isBeta ? '-BETA' : ''
                    }-win32-${arch}-setup.exe`,
                setupIcon: path.resolve(iconDir, 'objetivo.ico'),
                certificateFile: process.env['WINDOWS_CODESIGN_FILE'],
                certificatePassword: process.env['WINDOWS_CODESIGN_PASSWORD'],
            }),
        },
        {
            name: '@electron-forge/maker-dmg',
            platforms: ['darwin'],
            config: (arch) => ({
                name: `objetivo-tv-os-${version}-${arch}`,
                icon: path.resolve(iconDir, 'objetivo.icns'),
                additionalDMGOptions: {
                    'code-sign': {
                        identity:
                            'Developer ID Application: Julio Cesar Vera Neto (5UQ7TRCVCT)',
                        'signing-identity':
                            'Developer ID Application: Julio Cesar Vera Neto (5UQ7TRCVCT)',
                    },
                },
            }),
        },
        {
            name: '@electron-forge/maker-deb',
            platforms: ['linux'],
            config: commonLinuxConfig,
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['win32', 'linux', 'darwin'],
        },
        {
            name: '@electron-forge/maker-rpm',
            platforms: ['linux'],
            config: commonLinuxConfig,
        },
    ],
    publishers: [
        {
            name: '@electron-forge/publisher-github',
            config: {
                repository: {
                    owner: 'jvneto',
                    name: 'objetivo-tv-os',
                },
                prerelease: false,
            },
        },
    ],
};

function notarizeMaybe() {
    if (process.platform !== 'darwin') {
        return;
    }

    //   if (!process.env.CI) {
    //     console.log(`Not in CI, skipping notarization`);
    //     return;
    //   }

    if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD) {
        console.warn(
            'Should be notarizing, but environment variables APPLE_ID or APPLE_ID_PASSWORD are missing!',
        );
        return;
    }

    console.log(`Notarization OK`);

    config.packagerConfig.osxNotarize = {
        appBundleId: 'com.objetivo.tv_os',
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_ID_PASSWORD,
        ascProvider: '5UQ7TRCVCT',
    };
}

notarizeMaybe();

// Finally, export it
module.exports = config;
