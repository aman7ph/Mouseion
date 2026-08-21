package com.mouseionpdf

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class MouseionPdfPackage : BaseReactPackage() {

    override fun getModule(
        name: String,
        reactContext: ReactApplicationContext
    ): NativeModule? {
        return when (name) {
            MouseionPdfModule.NAME -> MouseionPdfModule(reactContext)
            else -> null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                MouseionPdfModule.NAME to ReactModuleInfo(
                    MouseionPdfModule.NAME,
                    MouseionPdfModule.NAME,
                    false,
                    false,
                    false,
                    true
                )
            )
        }
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> {
        return listOf(MouseionPdfViewManager(reactContext))
    }
}