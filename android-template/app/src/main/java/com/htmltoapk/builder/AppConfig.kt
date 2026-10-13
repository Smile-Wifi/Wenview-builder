package com.htmltoapk.builder

import org.json.JSONObject

data class WebViewSettings(
    val js: Boolean = true,
    val dom: Boolean = true,
    val file: Boolean = true,
    val zoom: Boolean = true,
    val cache: Boolean = true,
    val mixed: Boolean = false,
    val geo: Boolean = false,
    val debug: Boolean = false,
    val bridge: Boolean = false,
    val hardwareBackNav: Boolean = true,
    val inAppBackButton: Boolean = true
)

data class AppConfig(
    val appName: String = "Web App",
    val packageName: String = "com.htmltoapk.builder",
    val sourceType: String = "file",
    val webUrl: String = "",
    val splashEnabled: Boolean = true,
    val splashDurationMs: Long = 2000L,
    val introVideoFile: String = "",
    val videoBehavior: String = "play_once",
    val introAllowSkip: Boolean = true,
    val webView: WebViewSettings = WebViewSettings(),
    val adsEnabled: Boolean = false,
    val adBannerUnitId: String = ""
) {
    companion object {
        fun default(): AppConfig = AppConfig()

        fun fromJson(json: JSONObject): AppConfig {
            val wvJson = json.optJSONObject("webView") ?: JSONObject()
            val wv = WebViewSettings(
                js = wvJson.optBoolean("js", true),
                dom = wvJson.optBoolean("dom", true),
                file = wvJson.optBoolean("file", true),
                zoom = wvJson.optBoolean("zoom", true),
                cache = wvJson.optBoolean("cache", true),
                mixed = wvJson.optBoolean("mixed", false),
                geo = wvJson.optBoolean("geo", false),
                debug = wvJson.optBoolean("debug", false),
                bridge = wvJson.optBoolean("bridge", false),
                hardwareBackNav = wvJson.optBoolean("hardwareBackNav", true),
                inAppBackButton = wvJson.optBoolean("inAppBackButton", true)
            )

            val adsJson = json.optJSONObject("ads") ?: JSONObject()

            return AppConfig(
                appName = json.optString("appName", "Web App"),
                packageName = json.optString("packageName", "com.htmltoapk.builder"),
                sourceType = json.optString("sourceType", "file"),
                webUrl = json.optString("webUrl", ""),
                splashEnabled = json.optBoolean("splashEnabled", true),
                splashDurationMs = json.optLong("splashDurationMs", 2000L),
                introVideoFile = json.optString("introVideoFile", ""),
                videoBehavior = json.optString("videoBehavior", "play_once"),
                introAllowSkip = json.optBoolean("introAllowSkip", true),
                webView = wv,
                adsEnabled = adsJson.optBoolean("enabled", false),
                adBannerUnitId = adsJson.optString("bannerUnitId", "")
            )
        }
    }
}
