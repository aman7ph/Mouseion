package com.mouseionpdf

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.MouseionPdfViewManagerDelegate
import com.facebook.react.viewmanagers.MouseionPdfViewManagerInterface

@ReactModule(name = MouseionPdfViewManager.NAME)
class MouseionPdfViewManager(
    private val reactContext: ReactApplicationContext
) : SimpleViewManager<MouseionPdfView>(),
    MouseionPdfViewManagerInterface<MouseionPdfView> {

    private val delegate = MouseionPdfViewManagerDelegate(this)

    override fun getDelegate(): ViewManagerDelegate<MouseionPdfView> = delegate

    override fun getName(): String = NAME

    override fun createViewInstance(context: ThemedReactContext): MouseionPdfView {
        return MouseionPdfView(context)
    }

    @ReactProp(name = "filePath")
    override fun setFilePath(view: MouseionPdfView, value: String?) {
        value?.let { view.setFilePath(it) }
    }

    @ReactProp(name = "page", defaultInt = 0)
    override fun setPage(view: MouseionPdfView, value: Int) {
        view.setPage(value)
    }

    @ReactProp(name = "scale", defaultFloat = 1.0f)
    override fun setScale(view: MouseionPdfView, value: Float) {
        view.setScale(value)
    }

    companion object {
        const val NAME = "MouseionPdfView"
    }
}