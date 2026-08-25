package com.mouseionpdf

import android.net.Uri
import android.os.Build
import android.os.ext.SdkExtensions
import android.view.Choreographer
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.annotation.RequiresExtension
import androidx.fragment.app.FragmentActivity
import androidx.pdf.viewer.fragment.PdfViewerFragment
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

@ReactModule(name = MouseionPdfViewManager.NAME)
class MouseionPdfViewManager(
    private val reactContext: ReactApplicationContext
) : ViewGroupManager<FrameLayout>() {

    // These hold the current prop values so we can apply them
    // after the fragment is created via the "create" command
    private var pendingFilePath: String? = null
    private var pendingPage: Int = 0

    // Tracks the PdfViewerFragment instance per container view id
    private val fragmentMap = mutableMapOf<Int, PdfViewerFragment>()

    override fun getName(): String = NAME

    override fun createViewInstance(context: ThemedReactContext): FrameLayout {
        val layout = FrameLayout(context)
        layout.id = View.generateViewId()
        return layout
    }

    @ReactProp(name = "filePath")
    fun setFilePath(view: FrameLayout, value: String?) {
        pendingFilePath = value
        // If fragment already exists for this view, update it directly
        fragmentMap[view.id]?.let { fragment ->
            value?.let { applyFileToFragment(fragment, it) }
        }
    }

    @ReactProp(name = "page", defaultInt = 0)
    fun setPage(view: FrameLayout, value: Int) {
        pendingPage = value
        // Page jumping will be implemented after fragment is created
    }

    @ReactProp(name = "scale", defaultFloat = 1.0f)
    fun setScale(view: FrameLayout, value: Float) {
        // PdfViewerFragment handles zoom internally via pinch gesture
        // No programmatic scale API is exposed in alpha19
    }

    override fun getCommandsMap(): Map<String, Int> {
        return mapOf("create" to COMMAND_CREATE)
    }

    override fun receiveCommand(
        root: FrameLayout,
        commandId: String,
        args: ReadableArray?
    ) {
        super.receiveCommand(root, commandId, args)
        when (commandId) {
            "create" -> {
                val reactNativeViewId = args?.getInt(0) ?: return
                createFragment(root, reactNativeViewId)
            }
        }
    }

    @RequiresExtension(extension = Build.VERSION_CODES.S, version = 13)
    private fun createFragment(root: FrameLayout, reactNativeViewId: Int) {
        setupLayout(root)

        val pdfFragment = PdfViewerFragment()
        fragmentMap[root.id] = pdfFragment

        val activity = reactContext.currentActivity as? FragmentActivity ?: return
        activity.supportFragmentManager
            .beginTransaction()
            .replace(root.id, pdfFragment, root.id.toString())
            .commitNow()

        // Apply any props that arrived before fragment was ready
        pendingFilePath?.let { applyFileToFragment(pdfFragment, it) }
    }

    @RequiresExtension(extension = Build.VERSION_CODES.S, version = 13)
    private fun applyFileToFragment(fragment: PdfViewerFragment, filePath: String) {
        val cleanPath = filePath.removePrefix("file://")
        val uri = Uri.fromFile(java.io.File(cleanPath))
        fragment.documentUri = uri
    }

    private fun setupLayout(view: View) {
        Choreographer.getInstance().postFrameCallback(object : Choreographer.FrameCallback {
            override fun doFrame(frameTimeNanos: Long) {
                manuallyLayoutChildren(view)
                view.viewTreeObserver.dispatchOnGlobalLayout()
                Choreographer.getInstance().postFrameCallback(this)
            }
        })
    }

    private fun manuallyLayoutChildren(view: View) {
        val width = view.measuredWidth
        val height = view.measuredHeight
        if (width == 0 || height == 0) return
        view.measure(
            View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY)
        )
        view.layout(view.left, view.top, view.left + width, view.top + height)
    }

    override fun onDropViewInstance(view: FrameLayout) {
        super.onDropViewInstance(view)
        fragmentMap.remove(view.id)
    }

    companion object {
        const val NAME = "MouseionPdfView"
        private const val COMMAND_CREATE = 1
    }
}