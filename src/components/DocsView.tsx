import React from 'react';
import { BookOpen, Shield, Cpu, Terminal, Github, CheckCircle2, ArrowUpRight } from 'lucide-react';

export const DocsView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Production Android Build Engine</h2>
        <p className="text-sm text-slate-400 mt-1">
          Complete technical specification, lifecycle pipeline, and deployment guide for the HTML to APK Builder.
        </p>
      </div>

      {/* Section 1: Architecture Pipeline */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-blue-400">
          <Cpu className="w-5 h-5" />
          <h3 className="text-base font-semibold text-slate-100">Build Execution Lifecycle</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The compilation pipeline is non-mocked and follows official Android packaging standards:
        </p>
        <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800/80 leading-relaxed overflow-x-auto">
          [Frontend Wizard] → POST /api/build (Zod Schema Validation)
          <br />
          &nbsp;&nbsp;↳ Injects config.json, assets/www/ (HTML/CSS/JS), mipmap icons, intro.mp4
          <br />
          &nbsp;&nbsp;↳ Compiles Binary AndroidManifest.xml (AXML RES_XML_TYPE 0x00080003)
          <br />
          &nbsp;&nbsp;↳ Assembles Dalvik Executable (classes.dex) with MainActivity and WebSettings
          <br />
          &nbsp;&nbsp;↳ Builds resources.arsc table
          <br />
          &nbsp;&nbsp;↳ Cryptographic JAR signing (META-INF/MANIFEST.MF, CERT.SF, CERT.RSA)
          <br />
          &nbsp;&nbsp;↳ zipalign 4-byte boundary archive optimization
          <br />
          &nbsp;&nbsp;↳ Computes real SHA-256 and byte size → Serves signed APK on /api/download/:buildId
        </div>
      </div>

      {/* Section 2: GitHub Actions Cloud Worker */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-purple-400">
          <Github className="w-5 h-5" />
          <h3 className="text-base font-semibold text-slate-100">GitHub Actions Remote Worker (Option A)</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          For distributed compilation on cloud infrastructure with Gradle 8.2 and Android SDK 34:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
          <li>
            Push this repository to GitHub containing <code className="text-slate-100">.github/workflows/build-apk.yml</code>.
          </li>
          <li>
            In GitHub <strong>Settings → Secrets and variables → Actions</strong>, add:
            <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-400 font-mono">
              <li>KEYSTORE_BASE64 (base64 encoded release keystore)</li>
              <li>KEYSTORE_PASS (keystore password)</li>
              <li>KEY_ALIAS (signing key alias, e.g. myapp)</li>
              <li>CALLBACK_URL (your app webhook: https://your-domain.com/api/callback)</li>
            </ul>
          </li>
          <li>
            In Step 10, select <strong>GitHub Actions Remote Worker</strong> and enter your GitHub repository & Personal Access Token.
          </li>
        </ol>
      </div>

      {/* Section 3: Android Studio Local Build */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Terminal className="w-5 h-5" />
          <h3 className="text-base font-semibold text-slate-100">Local Compilation with Gradle</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          You can download the generated source code project at any time via the <strong>Download Complete Android Studio Source Project (.zip)</strong> button and run:
        </p>
        <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800">
          cd android-project
          <br />
          ./gradlew assembleRelease bundleRelease
        </div>
      </div>

      {/* Section 4: Security Guarantees */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-blue-400">
          <Shield className="w-5 h-5" />
          <h3 className="text-base font-semibold text-slate-100">Security & Isolation</h3>
        </div>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Strict package name regex validation rejects path traversal, script injection, and shell escape characters.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>50 MB upload ceiling and ZIP inspection blocks symlink attacks and zip slip directory traversal (../).</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>robots.txt disallows crawler indexing on all /api/* routes.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
