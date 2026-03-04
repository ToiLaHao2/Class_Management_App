const fs = require('fs');
const path = require('path');

/**
 * ModuleLoader — Tu dong phat hien va load cac AppModule tu libs/modules/
 *
 * Convention: moi module PHAI co file src/index.js export mot AppModule instance.
 * Module nao khong co file nay se bi bo qua (log canh bao).
 *
 * @param {import('express').Application} app
 * @param {Object} deps - Shared dependencies: { db, cache, eventBus }
 */
function loadModules(app, deps) {
    // Tim thu muc goc cua libs/modules tu vi tri hien tai cua file nay
    const modulesDir = path.resolve(__dirname, '../../../modules');

    if (!fs.existsSync(modulesDir)) {
        console.warn(`⚠️  Modules directory not found: ${modulesDir}`);
        return;
    }

    const moduleFolders = fs.readdirSync(modulesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    console.log(`\n🔍 Discovering modules in ${modulesDir}...`);

    for (const folder of moduleFolders) {
        const entryFile = path.join(modulesDir, folder, 'src', 'index.js');

        if (!fs.existsSync(entryFile)) {
            console.warn(`⚠️  Skipping [${folder}]: no src/index.js found`);
            continue;
        }

        try {
            const mod = require(entryFile);

            // Kiem tra contract: phai co method register()
            if (typeof mod.register !== 'function') {
                console.warn(`⚠️  Skipping [${folder}]: does not implement AppModule contract (missing register())`);
                continue;
            }

            mod.register(app, deps);

        } catch (err) {
            console.error(`❌ Failed to load module [${folder}]:`, err.message);
        }
    }

    console.log('✅ All modules loaded.\n');
}

module.exports = { loadModules };
