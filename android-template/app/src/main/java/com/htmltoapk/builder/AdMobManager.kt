package com.htmltoapk.builder

import android.app.Activity
import android.view.ViewGroup
import android.widget.FrameLayout

object AdMobManager {
    fun initBanner(activity: Activity, container: FrameLayout?, bannerUnitId: String) {
        if (container == null || bannerUnitId.isEmpty()) return

        try {
            // Dynamically loads Google Mobile Ads if present in dependencies
            val adViewClass = Class.forName("com.google.android.gms.ads.AdView")
            val adSizeClass = Class.forName("com.google.android.gms.ads.AdSize")
            val adRequestClass = Class.forName("com.google.android.gms.ads.AdRequest")
            val bannerField = adSizeClass.getField("BANNER")
            val bannerSize = bannerField.get(null)

            val adViewConstructor = adViewClass.getConstructor(android.content.Context::class.java)
            val adView = adViewConstructor.newInstance(activity)

            val setAdUnitIdMethod = adViewClass.getMethod("setAdUnitId", String::class.java)
            setAdUnitIdMethod.invoke(adView, bannerUnitId)

            val setAdSizeMethod = adViewClass.getMethod("setAdSize", adSizeClass)
            setAdSizeMethod.invoke(adView, bannerSize)

            val builderClass = Class.forName("com.google.android.gms.ads.AdRequest\$Builder")
            val builder = builderClass.getDeclaredConstructor().newInstance()
            val buildMethod = builderClass.getMethod("build")
            val adRequest = buildMethod.invoke(builder)

            val loadAdMethod = adViewClass.getMethod("loadAd", adRequestClass)
            loadAdMethod.invoke(adView, adRequest)

            container.addView(adView as android.view.View, ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ))
        } catch (e: Exception) {
            // AdMob dependency not bundled or preview environment
            e.printStackTrace()
        }
    }
}
