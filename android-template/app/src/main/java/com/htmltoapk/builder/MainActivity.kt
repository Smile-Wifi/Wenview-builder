package com.htmltoapk.builder

import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.TextView
import android.widget.VideoView
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject
import java.io.InputStreamReader

class MainActivity : AppCompatActivity() {

    private lateinit var config: AppConfig

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        config = loadConfig()

        // Configure hardware & gesture back button history navigation
        if (config.webView.hardwareBackNav) {
            onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    val wv = findViewById<WebView?>(R.id.webview)
                    if (wv != null && wv.canGoBack()) {
                        wv.goBack()
                    } else {
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed()
                    }
                }
            })
        }

        if (config.splashEnabled) {
            showSplashScreen()
        } else {
            launchWebView()
        }
    }

    private fun loadConfig(): AppConfig {
        return try {
            val inputStream = assets.open("config.json")
            val reader = InputStreamReader(inputStream)
            val jsonStr = reader.readText()
            reader.close()
            AppConfig.fromJson(JSONObject(jsonStr))
        } catch (e: Exception) {
            e.printStackTrace()
            AppConfig.default()
        }
    }

    private fun showSplashScreen() {
        setContentView(R.layout.activity_splash)

        val videoView = findViewById<VideoView?>(R.id.introVideo)
        val skipButton = findViewById<View?>(R.id.skipButton)

        if (config.introAllowSkip && skipButton != null) {
            skipButton.visibility = View.VISIBLE
            skipButton.setOnClickListener {
                launchWebView()
            }
        }

        if (config.introVideoFile.isNotEmpty() && videoView != null) {
            try {
                videoView.visibility = View.VISIBLE
                val rawId = resources.getIdentifier("intro", "raw", packageName)
                if (rawId != 0) {
                    val uri = Uri.parse("android.resource://$packageName/$rawId")
                    videoView.setVideoURI(uri)
                    videoView.setOnPreparedListener { mp ->
                        mp.isLooping = (config.videoBehavior == "loop")
                        videoView.start()
                    }
                    videoView.setOnCompletionListener {
                        launchWebView()
                    }
                    return
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        // Static splash timer fallback
        Handler(Looper.getMainLooper()).postDelayed({
            launchWebView()
        }, config.splashDurationMs)
    }

    private fun launchWebView() {
        setContentView(R.layout.activity_main)

        val wv = findViewById<WebView>(R.id.webview)
        val ws = wv.settings

        // In-App visible Top Back Button toolbar
        val topToolbar = findViewById<View?>(R.id.topToolbar)
        val btnBack = findViewById<View?>(R.id.btnBack)
        val toolbarTitle = findViewById<TextView?>(R.id.toolbarTitle)

        if (config.webView.inAppBackButton) {
            topToolbar?.visibility = View.VISIBLE
            toolbarTitle?.text = config.appName
            btnBack?.setOnClickListener {
                if (wv.canGoBack()) {
                    wv.goBack()
                } else {
                    finish()
                }
            }
        } else {
            topToolbar?.visibility = View.GONE
        }

        // WebView configuration strictly mapped to user preferences
        ws.javaScriptEnabled = config.webView.js
        ws.domStorageEnabled = config.webView.dom
        ws.allowFileAccess = config.webView.file
        ws.allowContentAccess = config.webView.file
        ws.setSupportZoom(config.webView.zoom)
        ws.builtInZoomControls = config.webView.zoom
        ws.displayZoomControls = false

        ws.cacheMode = if (config.webView.cache) {
            WebSettings.LOAD_DEFAULT
        } else {
            WebSettings.LOAD_NO_CACHE
        }

        ws.mixedContentMode = if (config.webView.mixed) {
            WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        } else {
            WebSettings.MIXED_CONTENT_NEVER_ALLOW
        }

        ws.setGeolocationEnabled(config.webView.geo)

        if (config.webView.debug) {
            WebView.setWebContentsDebuggingEnabled(true)
        }

        if (config.webView.bridge) {
            wv.addJavascriptInterface(Bridge(this), "Android")
        }

        wv.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                return false
            }
        }

        wv.webChromeClient = WebChromeClient()

        val targetUrl = if (config.sourceType == "url" && config.webUrl.isNotEmpty()) {
            config.webUrl
        } else {
            "file:///android_asset/www/index.html"
        }

        wv.loadUrl(targetUrl)

        // Initialize AdMob banner if configured
        if (config.adsEnabled) {
            AdMobManager.initBanner(this, findViewById(R.id.adContainer), config.adBannerUnitId)
        }
    }

    override fun onBackPressed() {
        val wv = findViewById<WebView?>(R.id.webview)
        if (wv != null && wv.canGoBack()) {
            wv.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
