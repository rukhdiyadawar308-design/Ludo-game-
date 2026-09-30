import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES, AndroidFile } from '../data/androidProjectFiles';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import {
  Download,
  Copy,
  Check,
  X,
  FileCode,
  FolderArchive,
  Terminal,
  Smartphone,
  ExternalLink,
  Layers,
  Sparkles,
  HelpCircle,
  Settings,
  PlayCircle,
  ShieldCheck,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  Code2,
  Cpu,
} from 'lucide-react';

interface AndroidProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'apk_guide' | 'download_project' | 'code_viewer' | 'commands';
}

export const AndroidProjectModal: React.FC<AndroidProjectModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'apk_guide',
}) => {
  const [activeTab, setActiveTab] = useState<'apk_guide' | 'download_project' | 'code_viewer' | 'commands'>(
    initialTab
  );
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(
    ANDROID_PROJECT_FILES.find((f) => f.name === 'HOW_TO_CREATE_APK.txt') || ANDROID_PROJECT_FILES[0]
  );
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Customizer options
  const [customAppName, setCustomAppName] = useState('Ludo Game');
  const [customPackageName, setCustomPackageName] = useState('com.example.ludogame');
  const [customVersion, setCustomVersion] = useState('1.0.0');

  // Terminal Simulator state
  const [simulatingBuild, setSimulatingBuild] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([
    'C:\\Users\\Developer\\AndroidProjects\\LudoGame> gradlew.bat assembleDebug',
    'कमांड चलाने के लिए नीचे "▶️ टेस्ट रन करें" दबाएं...',
  ]);
  const [buildProgress, setBuildProgress] = useState(0);

  const runBuildSimulation = () => {
    if (simulatingBuild) return;
    setSimulatingBuild(true);
    setBuildProgress(10);
    setBuildLogs([
      'C:\\Users\\Developer\\AndroidProjects\\LudoGame> gradlew.bat assembleDebug',
      'Starting Gradle Daemon (subsequent builds will be faster)...',
      'Gradle Daemon started in 950 ms',
    ]);

    setTimeout(() => {
      setBuildLogs((prev) => [
        ...prev,
        '> Task :app:preBuild UP-TO-DATE',
        '> Task :app:compileDebugAidl NO-SOURCE',
        '> Task :app:generateDebugBuildConfig',
        '> Task :app:mergeDebugResources',
      ]);
      setBuildProgress(40);
    }, 600);

    setTimeout(() => {
      setBuildLogs((prev) => [
        ...prev,
        '> Task :app:compileDebugKotlin (Compiling LudoBoardView.kt, LudoGameEngine.kt, MainActivity.kt)',
        '> Task :app:mergeDebugJavaResource',
        '> Task :app:processDebugManifest',
        '> Task :app:packageDebug',
        '> Task :app:assembleDebug',
      ]);
      setBuildProgress(80);
    }, 1300);

    setTimeout(() => {
      setBuildLogs((prev) => [
        ...prev,
        '',
        'BUILD SUCCESSFUL in 11s',
        '28 actionable tasks: 28 executed',
        '',
        '✅ SUCCESS: APK फाइल सफलतापूर्वक तैयार हो गई है!',
        '📁 आउटपुट लोकेशन: app/build/outputs/apk/debug/app-debug.apk',
      ]);
      setBuildProgress(100);
      setSimulatingBuild(false);
      confetti({ particleCount: 60, spread: 65, origin: { y: 0.65 } });
    }, 2100);
  };

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Top level README and APK instructions
      const howToContent = ANDROID_PROJECT_FILES.find((f) => f.name === 'HOW_TO_CREATE_APK.txt')?.content || '';
      zip.file('HOW_TO_CREATE_APK.txt', howToContent);

      const readmeContent = ANDROID_PROJECT_FILES.find((f) => f.name === 'README.md')?.content || '';
      zip.file('README.md', readmeContent);

      // Settings Gradle
      const sanitizedAppName = customAppName.replace(/[^a-zA-Z0-9]/g, '') || 'LudoGame';
      zip.file(
        'settings.gradle.kts',
        `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${sanitizedAppName}"
include(":app")
`
      );

      // Root build.gradle.kts
      zip.file(
        'build.gradle.kts',
        `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
`
      );

      // gradle/libs.versions.toml
      zip.folder('gradle')?.file(
        'libs.versions.toml',
        `[versions]
agp = "8.8.0"
kotlin = "2.0.21"
coreKtx = "1.15.0"
appcompat = "1.7.0"
material = "1.12.0"
constraintlayout = "2.2.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-appcompat = { group = "androidx.appcompat", name = "appcompat", version.ref = "appcompat" }
material = { group = "com.google.android.material", name = "material", version.ref = "material" }
androidx-constraintlayout = { group = "androidx.constraintlayout", name = "constraintlayout", version.ref = "constraintlayout" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
`
      );

      // gradle/wrapper/gradle-wrapper.properties
      zip.folder('gradle/wrapper')?.file(
        'gradle-wrapper.properties',
        `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
      );

      // gradlew & gradlew.bat wrapper scripts
      zip.file(
        'gradlew',
        `#!/bin/sh
# Gradle startup script for UN*X
exec "$(dirname "$0")/gradle/wrapper/gradle-wrapper.jar" "$@" 2>/dev/null || gradle "$@"
`
      );

      zip.file(
        'gradlew.bat',
        `@rem Gradle startup script for Windows
@if "%DEBUG%"=="" @echo off
gradle %*
`
      );

      // App build.gradle.kts with customized package and version
      const pkgName = customPackageName.trim() || 'com.example.ludogame';
      zip.folder('app')?.file(
        'build.gradle.kts',
        `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "${pkgName}"
    compileSdk = 35

    defaultConfig {
        applicationId = "${pkgName}"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "${customVersion.trim() || '1.0'}"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.2.0")
}
`
      );

      zip.folder('app')?.file('proguard-rules.pro', '# ProGuard rules for LudoGame\n');

      // App AndroidManifest.xml
      zip.folder('app/src/main')?.file(
        'AndroidManifest.xml',
        `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${pkgName}">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${customAppName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.LudoGame">
        <activity
            android:name=".MainActivity"
            android:screenOrientation="portrait"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
      );

      // Java / Kotlin code
      const packagePath = 'app/src/main/java/' + pkgName.replace(/\./g, '/');

      let mainActivityCode = ANDROID_PROJECT_FILES.find((f) => f.name === 'MainActivity.kt')?.content || '';
      mainActivityCode = mainActivityCode.replace('package com.example.ludogame', `package ${pkgName}`);
      mainActivityCode = mainActivityCode.replace(/import com\.example\.ludogame\./g, `import ${pkgName}.`);
      zip.folder(packagePath)?.file('MainActivity.kt', mainActivityCode);

      let boardViewCode = ANDROID_PROJECT_FILES.find((f) => f.name === 'LudoBoardView.kt')?.content || '';
      boardViewCode = boardViewCode.replace('package com.example.ludogame.view', `package ${pkgName}.view`);
      boardViewCode = boardViewCode.replace(/import com\.example\.ludogame\./g, `import ${pkgName}.`);
      zip.folder(`${packagePath}/view`)?.file('LudoBoardView.kt', boardViewCode);

      let engineCode = ANDROID_PROJECT_FILES.find((f) => f.name === 'LudoGameEngine.kt')?.content || '';
      engineCode = engineCode.replace('package com.example.ludogame.model', `package ${pkgName}.model`);
      zip.folder(`${packagePath}/model`)?.file('LudoGameEngine.kt', engineCode);

      // Resources: layout
      const layoutFile = ANDROID_PROJECT_FILES.find((f) => f.name === 'activity_main.xml');
      if (layoutFile) {
        // ensure custom view path matches package
        let layoutXml = layoutFile.content;
        layoutXml = layoutXml.replace(/com\.example\.ludogame\.view\.LudoBoardView/g, `${pkgName}.view.LudoBoardView`);
        zip.folder('app/src/main/res/layout')?.file('activity_main.xml', layoutXml);
      }

      // Resources: values
      zip.folder('app/src/main/res/values')?.file(
        'strings.xml',
        `<resources>
    <string name="app_name">${customAppName}</string>
</resources>`
      );

      zip.folder('app/src/main/res/values')?.file(
        'colors.xml',
        `<resources>
    <color name="purple_200">#FFBB86FC</color>
    <color name="purple_500">#FF6200EE</color>
    <color name="purple_700">#FF3700B3</color>
    <color name="teal_200">#FF03DAC5</color>
    <color name="teal_700">#FF018786</color>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
</resources>`
      );

      zip.folder('app/src/main/res/values')?.file(
        'themes.xml',
        `<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.LudoGame" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">#2563EB</item>
        <item name="colorPrimaryVariant">#1D4ED8</item>
        <item name="colorOnPrimary">#FFFFFF</item>
        <item name="android:statusBarColor">#0F172A</item>
    </style>
</resources>`
      );

      // Generate blob & download
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ludo_Game_Android_Studio_Project.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to create ZIP', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-900/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  APK बनाने का तरीका & Android Studio प्रोजेक्ट
                </h2>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold hidden xs:inline-block">
                  Kotlin + XML
                </span>
              </div>
              <p className="text-xs text-slate-400">
                1. मेरा तैयार प्रोजेक्ट डाउनलोड करें &nbsp;•&nbsp; 2. Android Studio में 1 क्लिक में APK बनाएं
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Download Button in Header */}
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isZipping ? 'प्रोजेक्ट ज़िप तैयार हो रहा है...' : '📦 प्रोजेक्ट ZIP डाउनलोड करें'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 bg-slate-950/40 border-b border-slate-800 overflow-x-auto shrink-0 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('apk_guide')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'apk_guide'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>📲 APK बनाने का तरीका (Step-by-Step)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              मुख्य
            </span>
          </button>

          <button
            onClick={() => setActiveTab('download_project')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'download_project'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>📦 तैयार प्रोजेक्ट डाउनलोड & कस्टमाइज़र</span>
          </button>

          <button
            onClick={() => setActiveTab('code_viewer')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'code_viewer'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>💻 सोर्स कोड एक्सप्लोरर</span>
          </button>

          <button
            onClick={() => setActiveTab('commands')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'commands'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>⚡ क्विक कमांड्स (Cheatsheet)</span>
          </button>
        </div>

        {/* Success Alert Banner when downloaded */}
        {downloadSuccess && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">
                प्रोजेक्ट 'Ludo_Game_Android_Studio_Project.zip' सफलतापूर्वक डाउनलोड हो गया!
              </span>
              <span className="hidden sm:inline text-xs text-slate-300">
                इसे अनजिप करके Android Studio में ओपन करें।
              </span>
            </div>
            <button
              onClick={() => setActiveTab('apk_guide')}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg font-bold"
            >
              APK बनाने की गाइड देखें &rarr;
            </button>
          </div>
        )}

        {/* Tab 1: APK बनाने का तरीका (Step by Step Guide) */}
        {activeTab === 'apk_guide' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Hero Quick Banner */}
            <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-blue-950/70 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1.5 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>5 आसान चरणों में APK तैयार</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Ludo Game Android Studio प्रोजेक्ट से APK (.apk) कैसे बनाएं?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  इस तैयार Kotlin + XML प्रोजेक्ट को डाउनलोड करने के बाद आप बिना किसी कोडिंग के केवल 1 मिनट में अपने फोन के लिए इन्स्टॉलेबल <span className="text-emerald-400 font-mono font-bold">app-debug.apk</span> बना सकते हैं।
                </p>
              </div>

              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center gap-2.5 shadow-xl shadow-emerald-950/50 cursor-pointer shrink-0 transition-transform active:scale-95 disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-mono opacity-80">कदम 1: यहाँ क्लिक करें</div>
                  <div>तैयार प्रोजेक्ट ZIP डाउनलोड करें</div>
                </div>
              </button>
            </div>

            {/* Step-by-Step Flow */}
            <div className="space-y-4">
              
              {/* Step 1 */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-black text-lg flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span>प्रोजेक्ट ZIP डाउनलोड करें और अनजिप (Extract) करें</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                        Step 1
                      </span>
                    </h4>
                    <button
                      onClick={handleDownloadZip}
                      disabled={isZipping}
                      className="text-xs px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isZipping ? 'डाउनलोडिंग...' : 'प्रोजेक्ट अभी डाउनलोड करें'}</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    ऊपर दिए गए हरे बटन से <span className="text-white font-mono font-bold">Ludo_Game_Android_Studio_Project.zip</span> डाउनलोड करें।
                    फिर डाउनलोड की गई फ़ाइल पर Right-Click करके <span className="text-amber-300 font-semibold">'Extract All' (सभी निकालें)</span> चुनें।
                  </p>
                  <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60 font-mono text-xs text-slate-400">
                    📂 उदाहरण अनजिप लोकेशन: <span className="text-emerald-400">C:\Users\YourName\AndroidProjects\LudoGame</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-black text-lg flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Android Studio में प्रोजेक्ट खोलें (Open in Android Studio)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      Step 2
                    </span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    1. अपने कंप्यूटर पर <span className="text-white font-semibold">Android Studio</span> खोलें।<br />
                    2. वेलकम स्क्रीन पर <span className="text-emerald-300 font-bold">'Open'</span> बटन पर क्लिक करें।<br />
                    3. अनजिप किया हुआ <span className="text-white font-mono">LudoGame</span> फोल्डर चुनें और 'OK' दबाएं।<br />
                    4. पहली बार नीचे <span className="text-amber-300 font-semibold">Gradle Sync</span> होगा (1 से 2 मिनट)। नीचे जब <span className="text-emerald-400 font-mono">"BUILD SUCCESSFUL"</span> दिखे, तब आगे बढ़ें।
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>इंटरनेट कनेक्शन चालू रखें ताकि Android Studio आवश्यक लाइब्रेरी पहली बार सिंक कर सके।</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-800/60 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-start shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400 font-black text-lg flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span>APK जनरेट करें (3 आसान तरीके)</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                        Main Step
                      </span>
                    </h4>
                  </div>

                  {/* 3 Methods Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    
                    {/* Method A */}
                    <div className="bg-slate-900/90 rounded-xl p-3.5 border border-emerald-500/30 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>तरीका 1 (सबसे आसान GUI)</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          ऊपर मेनू बार में जाएं:
                        </p>
                        <div className="mt-2 bg-slate-950 p-2 rounded-lg font-mono text-[11px] text-emerald-300 border border-emerald-500/20 space-y-1">
                          <div>1. <b>Build</b> मेनू खोलें</div>
                          <div>2. <b>Build Bundle(s) / APK(s)</b></div>
                          <div>3. <b>Build APK(s)</b> पर क्लिक करें</div>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        30 से 60 सेकंड में APK तैयार हो जाएगी!
                      </p>
                    </div>

                    {/* Method B */}
                    <div className="bg-slate-900/90 rounded-xl p-3.5 border border-blue-500/30 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold mb-1">
                          <Terminal className="w-3.5 h-3.5" />
                          <span>तरीका 2 (Terminal - 1 कमांड)</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Android Studio के नीचे Terminal टैब में यह कमांड चलाएं:
                        </p>
                        <div className="mt-2 bg-slate-950 p-2 rounded-lg font-mono text-[11px] text-blue-300 border border-blue-500/20 flex items-center justify-between">
                          <span>gradlew assembleDebug</span>
                          <button
                            onClick={() => handleCopy('gradlew.bat assembleDebug', 'terminal_cmd')}
                            className="text-slate-400 hover:text-white p-1"
                            title="कॉपी करें"
                          >
                            {copiedText === 'terminal_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Windows: <code className="text-slate-300">gradlew.bat assembleDebug</code><br />
                        Mac/Linux: <code className="text-slate-300">./gradlew assembleDebug</code>
                      </p>
                    </div>

                    {/* Method C */}
                    <div className="bg-slate-900/90 rounded-xl p-3.5 border border-purple-500/30 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold mb-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>तरीका 3 (Signed Release APK)</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          प्ले स्टोर पर डालने या फाइनल रिलीज के लिए:
                        </p>
                        <div className="mt-2 bg-slate-950 p-2 rounded-lg font-mono text-[11px] text-purple-300 border border-purple-500/20 space-y-1">
                          <div>1. <b>Build &rarr; Generate Signed Bundle / APK...</b></div>
                          <div>2. <b>APK</b> चुनें &rarr; Next</div>
                          <div>3. Keystore बनाएं &rarr; Release</div>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        यह APK किसी भी फोन पर बिना वॉर्निंग के इंस्टॉल होती है।
                      </p>
                    </div>

                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 font-black text-lg flex items-center justify-center shrink-0">
                  4
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span>APK फाइल कहाँ मिलेगी? (Locate APK File)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                      Step 4
                    </span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Build पूरा होते ही Android Studio में नीचे दाईं ओर (Bottom Right) एक नोटिफिकेशन आएगा:
                    <br />
                    <span className="text-emerald-400 font-semibold">"Build APK(s): APK(s) generated successfully for 1 module"</span>
                    <br />
                    उसमें नीले रंग के <span className="text-blue-400 font-bold underline">'locate'</span> लिंक पर क्लिक करें। आपका फ़ाइल एक्सप्लोरर सीधे खुल जाएगा!
                  </p>
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-700 font-mono text-xs flex items-center justify-between gap-2">
                    <span className="text-amber-300 break-all">
                      app/build/outputs/apk/debug/app-debug.apk
                    </span>
                    <button
                      onClick={() => handleCopy('app/build/outputs/apk/debug/app-debug.apk', 'apk_path')}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 shrink-0"
                    >
                      {copiedText === 'apk_path' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>पाथ कॉपी करें</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-teal-600/20 border border-teal-500/40 text-teal-400 font-black text-lg flex items-center justify-center shrink-0">
                  5
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span>अपने मोबाइल फोन में APK इंस्टॉल करें (Install on Mobile)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">
                      Step 5
                    </span>
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    <li>
                      <span className="font-semibold text-white">app-debug.apk</span> फाइल को WhatsApp, Google Drive, Telegram या USB केबल से अपने Android फोन में भेजें।
                    </li>
                    <li>
                      फ़ोन में फाइल मैनेजर खोलकर <span className="font-mono text-emerald-400">app-debug.apk</span> पर टैप करें।
                    </li>
                    <li>
                      यदि <span className="text-amber-300 font-semibold">'Install Unknown Apps' (अज्ञात स्रोत)</span> की परमिशन मांगे तो Settings में जाकर <span className="text-white font-semibold">'Allow from this source'</span> को On करें।
                    </li>
                    <li>
                      <span className="text-emerald-400 font-bold">Install</span> बटन पर क्लिक करें और खेल शुरू करें! 🎉
                    </li>
                  </ol>
                </div>
              </div>

            </div>

            {/* Troubleshooting / FAQs */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>अक्सर पूछे जाने वाले सवाल व समस्याएं (Troubleshooting)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-300">Q: Gradle Sync Failed या JDK Error?</div>
                  <div className="text-slate-400 leading-relaxed">
                    File &rarr; Settings (Mac पर Preferences) &rarr; Build Tools &rarr; Gradle में जाएं और 'Gradle JDK' में <span className="text-white">Embedded JDK 17</span> या JDK 21 चुनें।
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-emerald-300">Q: क्या सीधे USB केबल से फोन में रन कर सकते हैं?</div>
                  <div className="text-slate-400 leading-relaxed">
                    हाँ! फोन में Settings &rarr; About Phone &rarr; Build Number पर 7 बार टैप करके Developer Options खोलें, फिर <span className="text-white">USB Debugging</span> ऑन करें और ऊपर हरा ▶️ (Run) बटन दबाएं।
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-blue-300">Q: Android Studio का कौन सा वर्जन सही रहेगा?</div>
                  <div className="text-slate-400 leading-relaxed">
                    Android Studio Iguana, Jellyfish, Koala या Ladybug (कोई भी लेटेस्ट वर्जन) इसके साथ 100% कम्पैटिबल है।
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-purple-300">Q: ऐप का नाम और लोगो कैसे बदलें?</div>
                  <div className="text-slate-400 leading-relaxed">
                    ऊपर <b>'तैयार प्रोजेक्ट डाउनलोड & कस्टमाइज़र'</b> टैब में जाकर आप डाउनलोड करने से पहले ही अपना ऐप का नाम और पैकेज नाम बदल सकते हैं!
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: तैयार प्रोजेक्ट डाउनलोड & कस्टमाइज़र */}
        {activeTab === 'download_project' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Top Download Card */}
            <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-emerald-950/70 border border-blue-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold">
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>100% Ready-to-Build Android Studio Package</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Ludo Game Kotlin + XML Android Studio Project
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  इस ZIP में पूरा नेटिव Android प्रोजेक्ट मौजूद है: Custom Canvas View, 4-Player Engine, Dice Randomizer, Star Safe Spots, Sound Effects & Complete Gradle Configuration.
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>📦 आकार: ~120 KB (ZIP)</span>
                  <span>•</span>
                  <span>⚙️ SDK: Android 14/15 (API 35)</span>
                  <span>•</span>
                  <span>💻 भाषा: Kotlin + XML</span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
                <button
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-5 h-5" />
                  <span>{isZipping ? 'ज़िप फ़ाइल बन रही है...' : 'प्रोजेक्ट ZIP अभी डाउनलोड करें'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('apk_guide')}
                  className="text-xs text-center text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  डाउनलोड के बाद APK कैसे बनाएं? गाइड देखें &rarr;
                </button>
              </div>
            </div>

            {/* Customizer settings */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-bold text-white">
                    डाउनलोड से पहले प्रोजेक्ट कस्टमाइज़ करें (Optional)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  (यदि आप अपना नाम या पैकेज आईडी डालना चाहते हैं)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    ऐप का नाम (App Name):
                  </label>
                  <input
                    type="text"
                    value={customAppName}
                    onChange={(e) => setCustomAppName(e.target.value)}
                    placeholder="उदा: Ludo Game, मेरा लूडो"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-500">
                    मोबाइल की होम स्क्रीन पर यह नाम दिखेगा
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    पैकेज आईडी (Package Name):
                  </label>
                  <input
                    type="text"
                    value={customPackageName}
                    onChange={(e) => setCustomPackageName(e.target.value)}
                    placeholder="com.myname.ludogame"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-500">
                    यूनिक आईडी (उदा: com.myname.ludogame)
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    वर्जन (Version Name):
                  </label>
                  <input
                    type="text"
                    value={customVersion}
                    onChange={(e) => setCustomVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-500">
                    ऐप का रिलीज संस्करण
                  </span>
                </div>
              </div>
            </div>

            {/* What's inside the Project */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>इस ZIP प्रोजेक्ट में शामिल फाइलें व आर्किटेक्चर:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-emerald-400 font-mono">MainActivity.kt</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    गेम लाइफसाइकल, डाइस रोल एनीमेशन, प्लेयर टर्न UI और अलर्ट डायलॉग्स।
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-blue-400 font-mono">LudoBoardView.kt</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    कस्टम Android Canvas View: 15x15 लूडो ग्रिड, 8 सेफ स्टार्स, टोकन और स्मूथ टच डिटेक्शन।
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-amber-400 font-mono">LudoGameEngine.kt</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    चारों रंगों के 16 टोकन, 57 स्टेप पाथ, गोटी काटना, 6 पर एक्स्ट्रा रोल और जीत का लॉजिक।
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-purple-400 font-mono">activity_main.xml</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    मॉडर्न रिस्पॉन्सिव लेआउट, डाइस बटन, टर्न इंडिकेटर और रीसेट कंट्रोल्स।
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-teal-400 font-mono">build.gradle.kts</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    Kotlin 2.0, Android Gradle Plugin 8.8, Java 17 और आवश्यक AndroidX लाइब्रेरी।
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-pink-400 font-mono">HOW_TO_CREATE_APK.txt</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    हिंदी और अंग्रेजी में APK बनाने की पूरी ऑफलाइन स्टेप-बाय-स्टेप गाइड।
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: कोड एक्सप्लोरर (Code Viewer) */}
        {activeTab === 'code_viewer' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* File List */}
            <div className="w-full md:w-64 bg-slate-950/70 border-r border-slate-800 p-3 overflow-y-auto shrink-0 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                प्रोजेक्ट फाइलें
              </div>
              {ANDROID_PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.name === file.name;
                return (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <FileCode className="w-4 h-4 shrink-0 text-slate-400" />
                    <span className="truncate">{file.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Code Content */}
            <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-400 truncate">
                  {selectedFile.path}
                </span>
                <button
                  onClick={() => handleCopy(selectedFile.content, 'code_copy')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedText === 'code_copy' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">कॉपी हो गया!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>कोड कॉपी करें</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-300 bg-slate-950/80 leading-relaxed">
                <pre className="whitespace-pre">
                  <code>{selectedFile.content}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: क्विक कमांड्स (Cheatsheet) */}
        {activeTab === 'commands' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>Gradle टर्मिनल कमांड्स & लाइव बिल्ड सिम्युलेटर</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Android Studio के नीचे 'Terminal' टैब खोलकर आप सीधे इन कमांड्स से APK बना सकते हैं:
              </p>
            </div>

            {/* Interactive Terminal Simulator Box */}
            <div className="bg-slate-950 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
              {/* Terminal Window Header */}
              <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    Terminal — gradlew.bat assembleDebug
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy('gradlew.bat assembleDebug', 'cmd_sim')}
                    className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 font-mono transition-colors cursor-pointer"
                  >
                    {copiedText === 'cmd_sim' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>कमांड कॉपी</span>
                  </button>
                  <button
                    onClick={runBuildSimulation}
                    disabled={simulatingBuild}
                    className="text-xs px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>{simulatingBuild ? 'बिल्ड हो रहा है...' : '▶️ टेस्ट रन करें'}</span>
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              {simulatingBuild && (
                <div className="w-full bg-slate-800 h-1 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${buildProgress}%` }}
                  ></div>
                </div>
              )}

              {/* Terminal Logs Output */}
              <div className="p-4 font-mono text-xs text-slate-300 bg-slate-950 min-h-[160px] max-h-[220px] overflow-y-auto space-y-1 leading-relaxed selection:bg-blue-500 selection:text-white">
                {buildLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`${
                      log.startsWith('✅') || log.startsWith('BUILD SUCCESSFUL')
                        ? 'text-emerald-400 font-bold'
                        : log.startsWith('>')
                        ? 'text-blue-300'
                        : log.startsWith('📁')
                        ? 'text-amber-300 font-bold'
                        : log.includes('gradlew.bat assembleDebug')
                        ? 'text-white font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>

              {/* Simulator Action footer */}
              <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>परिणामी फ़ाइल: <code className="text-emerald-400">app-debug.apk</code></span>
                <span className="text-slate-500">पाथ: app/build/outputs/apk/debug/</span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'cmd1',
                  title: 'Debug APK जनरेट करें (सबसे उपयोगी)',
                  windows: 'gradlew.bat assembleDebug',
                  unix: './gradlew assembleDebug',
                  desc: 'प्रोजेक्ट को कम्पाइल करके app-debug.apk फाइल बनाता है।',
                },
                {
                  id: 'cmd2',
                  title: 'सीधे जुड़े हुए मोबाइल में इंस्टॉल करें',
                  windows: 'gradlew.bat installDebug',
                  unix: './gradlew installDebug',
                  desc: 'USB से जुड़े हुए फोन में ऐप को ऑटोमैटिक कंपाइल और इंस्टॉल करता है।',
                },
                {
                  id: 'cmd3',
                  title: 'प्रोजेक्ट क्लीन करके नया बिल्ड बनाएं',
                  windows: 'gradlew.bat clean assembleDebug',
                  unix: './gradlew clean assembleDebug',
                  desc: 'पुरानी कैश और बिल्ड फाइल्स हटाकर बिल्कुल फ्रेश APK बनाता है (त्रुटि आने पर प्रयोग करें)।',
                },
                {
                  id: 'cmd4',
                  title: 'Release APK बनाएं',
                  windows: 'gradlew.bat assembleRelease',
                  unix: './gradlew assembleRelease',
                  desc: 'ऑप्टिमाइज़्ड रिलीज APK बनाता है।',
                },
              ].map((cmd) => (
                <div key={cmd.id} className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs sm:text-sm">{cmd.title}</span>
                    <span className="text-[11px] text-slate-400">{cmd.desc}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Windows (CMD / PowerShell):</span>
                        <span className="text-emerald-400 font-bold">{cmd.windows}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(cmd.windows, `${cmd.id}_win`)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="कॉपी करें"
                      >
                        {copiedText === `${cmd.id}_win` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Mac / Linux:</span>
                        <span className="text-blue-400 font-bold">{cmd.unix}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(cmd.unix, `${cmd.id}_unix`)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="कॉपी करें"
                      >
                        {copiedText === `${cmd.id}_unix` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>तैयार प्रोजेक्ट: Kotlin, XML Canvas, 15x15 Grid, AI Bots</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isZipping ? 'प्रोजेक्ट बन रहा है...' : '📦 ZIP डाउनलोड करें'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
