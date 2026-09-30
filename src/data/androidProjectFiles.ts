export interface AndroidFile {
  path: string;
  name: string;
  language: 'kotlin' | 'xml' | 'gradle' | 'markdown';
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    name: 'MainActivity.kt',
    path: 'app/src/main/java/com/example/ludogame/MainActivity.kt',
    language: 'kotlin',
    content: `package com.example.ludogame

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.example.ludogame.model.LudoGameEngine
import com.example.ludogame.model.PlayerColor
import com.example.ludogame.view.LudoBoardView
import kotlin.random.Random

class MainActivity : AppCompatActivity() {

    private lateinit var boardView: LudoBoardView
    private lateinit var tvTurnInfo: TextView
    private lateinit var tvDiceResult: TextView
    private lateinit var btnRollDice: Button
    private lateinit var btnResetGame: Button
    private lateinit var ivCurrentPlayerDot: ImageView

    private val gameEngine = LudoGameEngine()
    private var currentDiceValue: Int = 1
    private var isRolling = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        boardView = findViewById(R.id.boardView)
        tvTurnInfo = findViewById(R.id.tvTurnInfo)
        tvDiceResult = findViewById(R.id.tvDiceResult)
        btnRollDice = findViewById(R.id.btnRollDice)
        btnResetGame = findViewById(R.id.btnResetGame)
        ivCurrentPlayerDot = findViewById(R.id.ivCurrentPlayerDot)

        boardView.attachEngine(gameEngine)

        btnRollDice.setOnClickListener {
            if (!isRolling && gameEngine.canRollDice) {
                rollDice()
            }
        }

        btnResetGame.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("नया खेल (New Game)")
                .setMessage("क्या आप खेल दोबारा शुरू करना चाहते हैं?")
                .setPositiveButton("हाँ") { _, _ ->
                    gameEngine.resetGame()
                    updateUi()
                    boardView.invalidate()
                }
                .setNegativeButton("रद्द करें", null)
                .show()
        }

        boardView.setOnTokenMovedListener { winner ->
            updateUi()
            if (winner != null) {
                showWinnerDialog(winner)
            }
        }

        updateUi()
    }

    private fun rollDice() {
        isRolling = true
        btnRollDice.isEnabled = false

        // Dice roll animation simulation
        var count = 0
        val runnable = object : Runnable {
            override fun run() {
                val tempDice = Random.nextInt(1, 7)
                tvDiceResult.text = tempDice.toString()
                count++
                if (count < 8) {
                    tvDiceResult.postDelayed(this, 50)
                } else {
                    currentDiceValue = Random.nextInt(1, 7)
                    tvDiceResult.text = currentDiceValue.toString()
                    isRolling = false
                    gameEngine.onDiceRolled(currentDiceValue)
                    updateUi()
                    boardView.invalidate()

                    // Check if player has no valid moves
                    val validMoves = gameEngine.getValidMoves(currentDiceValue)
                    if (validMoves.isEmpty()) {
                        Toast.makeText(
                            this@MainActivity,
                            "\${gameEngine.currentPlayer.color} के लिए कोई चाल उपलब्ध नहीं!",
                            Toast.LENGTH_SHORT
                        ).show()
                        gameEngine.nextTurn()
                        updateUi()
                    }
                }
            }
        }
        tvDiceResult.post(runnable)
    }

    private fun updateUi() {
        val current = gameEngine.currentPlayer
        tvTurnInfo.text = "बारी: \${current.nameHindi} (\${current.color})"
        btnRollDice.isEnabled = gameEngine.canRollDice && !isRolling

        when (current.color) {
            PlayerColor.RED -> ivCurrentPlayerDot.setBackgroundColor(0xFFDC2626.toInt())
            PlayerColor.GREEN -> ivCurrentPlayerDot.setBackgroundColor(0xFF059669.toInt())
            PlayerColor.YELLOW -> ivCurrentPlayerDot.setBackgroundColor(0xFFD97706.toInt())
            PlayerColor.BLUE -> ivCurrentPlayerDot.setBackgroundColor(0xFF2563EB.toInt())
        }
    }

    private fun showWinnerDialog(winner: PlayerColor) {
        AlertDialog.Builder(this)
            .setTitle("🏆 बधाई हो! (Winner!)")
            .setMessage("खिलाड़ी \$winner ने लूडो मुकाबला जीत लिया है!")
            .setPositiveButton("नया मुकाबला") { _, _ ->
                gameEngine.resetGame()
                updateUi()
                boardView.invalidate()
            }
            .setCancelable(false)
            .show()
    }
}
`,
  },
  {
    name: 'LudoBoardView.kt',
    path: 'app/src/main/java/com/example/ludogame/view/LudoBoardView.kt',
    language: 'kotlin',
    content: `package com.example.ludogame.view

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import com.example.ludogame.model.LudoGameEngine
import com.example.ludogame.model.PlayerColor
import kotlin.math.min

class LudoBoardView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private var engine: LudoGameEngine? = null
    private var onTokenMoved: ((PlayerColor?) -> Unit)? = null

    private val gridPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.DKGRAY
        style = Paint.Style.STROKE
        strokeWidth = 2f
    }

    private val redPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFFDC2626.toInt() }
    private val greenPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFF059669.toInt() }
    private val yellowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFFD97706.toInt() }
    private val bluePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFF2563EB.toInt() }
    private val whitePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.WHITE }

    fun attachEngine(gameEngine: LudoGameEngine) {
        this.engine = gameEngine
    }

    fun setOnTokenMovedListener(listener: (PlayerColor?) -> Unit) {
        this.onTokenMoved = listener
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val width = MeasureSpec.getSize(widthMeasureSpec)
        val height = MeasureSpec.getSize(heightMeasureSpec)
        val size = min(width, height)
        setMeasuredDimension(size, size)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val cellSize = width / 15f

        drawYards(canvas, cellSize)
        drawGridAndPaths(canvas, cellSize)
        drawHomeCenter(canvas, cellSize)
        drawTokens(canvas, cellSize)
    }

    private fun drawYards(canvas: Canvas, cs: Float) {
        // Green Yard (Top-Left: 6x6)
        canvas.drawRect(0f, 0f, 6 * cs, 6 * cs, greenPaint)
        canvas.drawRect(1 * cs, 1 * cs, 5 * cs, 5 * cs, whitePaint)

        // Yellow Yard (Top-Right: 6x6)
        canvas.drawRect(9 * cs, 0f, 15 * cs, 6 * cs, yellowPaint)
        canvas.drawRect(10 * cs, 1 * cs, 14 * cs, 5 * cs, whitePaint)

        // Red Yard (Bottom-Left: 6x6)
        canvas.drawRect(0f, 9 * cs, 6 * cs, 15 * cs, redPaint)
        canvas.drawRect(1 * cs, 10 * cs, 5 * cs, 14 * cs, whitePaint)

        // Blue Yard (Bottom-Right: 6x6)
        canvas.drawRect(9 * cs, 9 * cs, 15 * cs, 15 * cs, bluePaint)
        canvas.drawRect(10 * cs, 10 * cs, 14 * cs, 14 * cs, whitePaint)
    }

    private fun drawGridAndPaths(canvas: Canvas, cs: Float) {
        // Draw standard 15x15 cell outlines
        for (r in 0 until 15) {
            for (c in 0 until 15) {
                // Skip yard centers to keep white space clean
                val isYardCenter = (r in 1..4 && (c in 1..4 || c in 10..13)) ||
                                   (r in 10..13 && (c in 1..4 || c in 10..13))
                val isCenter = r in 6..8 && c in 6..8
                if (!isYardCenter && !isCenter) {
                    canvas.drawRect(c * cs, r * cs, (c + 1) * cs, (r + 1) * cs, gridPaint)
                }
            }
        }

        // Colored home corridors
        // Green Home Corridor (row 7, col 1..5)
        for (c in 1..5) canvas.drawRect(c * cs, 7 * cs, (c + 1) * cs, 8 * cs, greenPaint)
        // Yellow Home Corridor (col 7, row 1..5)
        for (r in 1..5) canvas.drawRect(7 * cs, r * cs, 8 * cs, (r + 1) * cs, yellowPaint)
        // Blue Home Corridor (row 7, col 9..13)
        for (c in 9..13) canvas.drawRect(c * cs, 7 * cs, (c + 1) * cs, 8 * cs, bluePaint)
        // Red Home Corridor (col 7, row 9..13)
        for (r in 9..13) canvas.drawRect(7 * cs, r * cs, 8 * cs, (r + 1) * cs, redPaint)

        // Start spots
        canvas.drawRect(1 * cs, 6 * cs, 2 * cs, 7 * cs, greenPaint)
        canvas.drawRect(8 * cs, 1 * cs, 9 * cs, 2 * cs, yellowPaint)
        canvas.drawRect(13 * cs, 8 * cs, 14 * cs, 9 * cs, bluePaint)
        canvas.drawRect(6 * cs, 13 * cs, 7 * cs, 14 * cs, redPaint)
    }

    private fun drawHomeCenter(canvas: Canvas, cs: Float) {
        val cx = 7.5f * cs
        val cy = 7.5f * cs

        val path = Path()

        // Green Triangle (Left)
        path.reset()
        path.moveTo(6 * cs, 6 * cs)
        path.lineTo(cx, cy)
        path.lineTo(6 * cs, 9 * cs)
        path.close()
        canvas.drawPath(path, greenPaint)

        // Yellow Triangle (Top)
        path.reset()
        path.moveTo(6 * cs, 6 * cs)
        path.lineTo(cx, cy)
        path.lineTo(9 * cs, 6 * cs)
        path.close()
        canvas.drawPath(path, yellowPaint)

        // Blue Triangle (Right)
        path.reset()
        path.moveTo(9 * cs, 6 * cs)
        path.lineTo(cx, cy)
        path.lineTo(9 * cs, 9 * cs)
        path.close()
        canvas.drawPath(path, bluePaint)

        // Red Triangle (Bottom)
        path.reset()
        path.moveTo(6 * cs, 9 * cs)
        path.lineTo(cx, cy)
        path.lineTo(9 * cs, 9 * cs)
        path.close()
        canvas.drawPath(path, redPaint)
    }

    private fun drawTokens(canvas: Canvas, cs: Float) {
        val eng = engine ?: return
        for (player in eng.players) {
            val paint = when (player.color) {
                PlayerColor.RED -> redPaint
                PlayerColor.GREEN -> greenPaint
                PlayerColor.YELLOW -> yellowPaint
                PlayerColor.BLUE -> bluePaint
            }
            for (token in player.tokens) {
                val coord = eng.getTokenCoordinate(token)
                val cx = (coord.col + 0.5f) * cs
                val cy = (coord.row + 0.5f) * cs
                val radius = cs * 0.38f

                // Token outer ring & body
                canvas.drawCircle(cx, cy, radius, paint)
                canvas.drawCircle(cx, cy, radius * 0.65f, whitePaint)
                canvas.drawCircle(cx, cy, radius * 0.35f, paint)
            }
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (event.action == MotionEvent.ACTION_DOWN) {
            val eng = engine ?: return false
            if (eng.canRollDice) return false // Must roll dice first

            val cs = width / 15f
            val touchCol = (event.x / cs).toInt()
            val touchRow = (event.y / cs).toInt()

            val moved = eng.tryMoveTokenAt(touchRow, touchCol)
            if (moved) {
                invalidate()
                val winner = eng.checkWinner()
                onTokenMoved?.invoke(winner)
                return true
            }
        }
        return super.onTouchEvent(event)
    }
}
`,
  },
  {
    name: 'LudoGameEngine.kt',
    path: 'app/src/main/java/com/example/ludogame/model/LudoGameEngine.kt',
    language: 'kotlin',
    content: `package com.example.ludogame.model

enum class PlayerColor {
    RED, GREEN, YELLOW, BLUE
}

data class Token(
    val id: Int,
    val color: PlayerColor,
    var stepCount: Int = -1 // -1 = yard, 0..50 = track, 51..55 = corridor, 56 = home
)

data class Player(
    val color: PlayerColor,
    val nameHindi: String,
    val tokens: List<Token> = List(4) { Token(it, color) }
)

data class CellCoord(val row: Float, val col: Float)

class LudoGameEngine {

    val players = listOf(
        Player(PlayerColor.RED, "लाल"),
        Player(PlayerColor.GREEN, "हरा"),
        Player(PlayerColor.YELLOW, "पीला"),
        Player(PlayerColor.BLUE, "नीला")
    )

    var currentTurnIndex = 0
    val currentPlayer: Player
        get() = players[currentTurnIndex]

    var currentDiceValue: Int = 0
    var canRollDice: Boolean = true

    fun resetGame() {
        currentTurnIndex = 0
        currentDiceValue = 0
        canRollDice = true
        players.forEach { player ->
            player.tokens.forEach { it.stepCount = -1 }
        }
    }

    fun onDiceRolled(dice: Int) {
        currentDiceValue = dice
        canRollDice = false
    }

    fun getValidMoves(dice: Int): List<Token> {
        return currentPlayer.tokens.filter { token ->
            if (token.stepCount == -1) {
                dice == 6
            } else if (token.stepCount == 56) {
                false
            } else {
                token.stepCount + dice <= 56
            }
        }
    }

    fun tryMoveTokenAt(row: Int, col: Int): Boolean {
        if (canRollDice) return false

        val validTokens = getValidMoves(currentDiceValue)
        val selectedToken = validTokens.firstOrNull { token ->
            val coord = getTokenCoordinate(token)
            coord.row.toInt() == row && coord.col.toInt() == col
        } ?: return false

        // Execute Move
        if (selectedToken.stepCount == -1 && currentDiceValue == 6) {
            selectedToken.stepCount = 0
        } else {
            selectedToken.stepCount += currentDiceValue
        }

        // Check captures (if on main track)
        checkCapture(selectedToken)

        // If rolled a 6 or captured, player gets an extra roll
        if (currentDiceValue != 6) {
            nextTurn()
        } else {
            canRollDice = true
        }

        return true
    }

    private fun checkCapture(movedToken: Token) {
        if (movedToken.stepCount in 0..50) {
            val movedTrackIdx = getTrackIndex(movedToken.color, movedToken.stepCount)
            // Safe indexes on track: 0, 8, 13, 21, 26, 34, 39, 47
            val safeSpots = listOf(0, 8, 13, 21, 26, 34, 39, 47)
            if (movedTrackIdx !in safeSpots) {
                players.forEach { oppPlayer ->
                    if (oppPlayer.color != movedToken.color) {
                        oppPlayer.tokens.forEach { oppToken ->
                            if (oppToken.stepCount in 0..50) {
                                val oppTrackIdx = getTrackIndex(oppToken.color, oppToken.stepCount)
                                if (oppTrackIdx == movedTrackIdx) {
                                    // Captured! Send back to yard
                                    oppToken.stepCount = -1
                                    canRollDice = true // Extra turn on capture
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    fun nextTurn() {
        currentTurnIndex = (currentTurnIndex + 1) % players.size
        canRollDice = true
    }

    fun checkWinner(): PlayerColor? {
        val winner = players.firstOrNull { player ->
            player.tokens.all { it.stepCount == 56 }
        }
        return winner?.color
    }

    fun getTrackIndex(color: PlayerColor, stepCount: Int): Int {
        val startOffset = when (color) {
            PlayerColor.GREEN -> 0
            PlayerColor.YELLOW -> 13
            PlayerColor.BLUE -> 26
            PlayerColor.RED -> 39
        }
        return (startOffset + stepCount) % 52
    }

    fun getTokenCoordinate(token: Token): CellCoord {
        if (token.stepCount == -1) {
            return getYardCoordinate(token.color, token.id)
        }
        if (token.stepCount in 0..50) {
            val trackIdx = getTrackIndex(token.color, token.stepCount)
            return trackCoordinates[trackIdx]
        }
        if (token.stepCount in 51..55) {
            return getCorridorCoordinate(token.color, token.stepCount - 51)
        }
        // Step 56: Home center
        return CellCoord(7.5f, 7.5f)
    }

    private fun getYardCoordinate(color: PlayerColor, id: Int): CellCoord {
        val offsets = listOf(
            Pair(1.5f, 1.5f),
            Pair(1.5f, 3.5f),
            Pair(3.5f, 1.5f),
            Pair(3.5f, 3.5f)
        )[id]
        return when (color) {
            PlayerColor.GREEN -> CellCoord(offsets.first, offsets.second)
            PlayerColor.YELLOW -> CellCoord(offsets.first, offsets.second + 9f)
            PlayerColor.RED -> CellCoord(offsets.first + 9f, offsets.second)
            PlayerColor.BLUE -> CellCoord(offsets.first + 9f, offsets.second + 9f)
        }
    }

    private fun getCorridorCoordinate(color: PlayerColor, index: Int): CellCoord {
        return when (color) {
            PlayerColor.GREEN -> CellCoord(7f, (1 + index).toFloat())
            PlayerColor.YELLOW -> CellCoord((1 + index).toFloat(), 7f)
            PlayerColor.BLUE -> CellCoord(7f, (13 - index).toFloat())
            PlayerColor.RED -> CellCoord((13 - index).toFloat(), 7f)
        }
    }

    companion object {
        val trackCoordinates = listOf(
            CellCoord(6f, 1f), CellCoord(6f, 2f), CellCoord(6f, 3f), CellCoord(6f, 4f), CellCoord(6f, 5f),
            CellCoord(5f, 6f), CellCoord(4f, 6f), CellCoord(3f, 6f), CellCoord(2f, 6f), CellCoord(1f, 6f), CellCoord(0f, 6f),
            CellCoord(0f, 7f), CellCoord(0f, 8f),
            CellCoord(1f, 8f), CellCoord(2f, 8f), CellCoord(3f, 8f), CellCoord(4f, 8f), CellCoord(5f, 8f),
            CellCoord(6f, 9f), CellCoord(6f, 10f), CellCoord(6f, 11f), CellCoord(6f, 12f), CellCoord(6f, 13f), CellCoord(6f, 14f),
            CellCoord(7f, 14f), CellCoord(8f, 14f),
            CellCoord(8f, 13f), CellCoord(8f, 12f), CellCoord(8f, 11f), CellCoord(8f, 10f), CellCoord(8f, 9f),
            CellCoord(9f, 8f), CellCoord(10f, 8f), CellCoord(11f, 8f), CellCoord(12f, 8f), CellCoord(13f, 8f), CellCoord(14f, 8f),
            CellCoord(14f, 7f), CellCoord(14f, 6f),
            CellCoord(13f, 6f), CellCoord(12f, 6f), CellCoord(11f, 6f), CellCoord(10f, 6f), CellCoord(9f, 6f),
            CellCoord(8f, 5f), CellCoord(8f, 4f), CellCoord(8f, 3f), CellCoord(8f, 2f), CellCoord(8f, 1f), CellCoord(8f, 0f),
            CellCoord(7f, 0f), CellCoord(6f, 0f)
        )
    }
}
`,
  },
  {
    name: 'activity_main.xml',
    path: 'app/src/main/res/layout/activity_main.xml',
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:background="#0F172A"
    android:padding="16dp"
    android:gravity="center_horizontal">

    <!-- Header -->
    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="लूडो गेम (Ludo Game 4-Player)"
        android:textColor="#FFFFFF"
        android:textSize="22sp"
        android:textStyle="bold"
        android:layout_marginTop="8dp"
        android:layout_marginBottom="12dp" />

    <!-- Turn status bar -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center"
        android:background="#1E293B"
        android:padding="10dp"
        android:layout_marginBottom="12dp">

        <ImageView
            android:id="@+id/ivCurrentPlayerDot"
            android:layout_width="18dp"
            android:layout_height="18dp"
            android:layout_marginEnd="8dp" />

        <TextView
            android:id="@+id/tvTurnInfo"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="बारी: लाल (Red)"
            android:textColor="#F8FAFC"
            android:textSize="16sp"
            android:textStyle="bold" />
    </LinearLayout>

    <!-- Interactive Ludo Board View -->
    <com.example.ludogame.view.LudoBoardView
        android:id="@+id/boardView"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:background="#FFFFFF" />

    <!-- Action Controls: Dice + Reset -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center"
        android:layout_marginTop="16dp"
        android:layout_marginBottom="8dp">

        <TextView
            android:id="@+id/tvDiceResult"
            android:layout_width="60dp"
            android:layout_height="60dp"
            android:background="#F8FAFC"
            android:textColor="#0F172A"
            android:textSize="28sp"
            android:textStyle="bold"
            android:gravity="center"
            android:text="⚂"
            android:layout_marginEnd="16dp" />

        <Button
            android:id="@+id/btnRollDice"
            android:layout_width="wrap_content"
            android:layout_height="56dp"
            android:text="पासा फेंकें (Roll Dice)"
            android:textSize="16sp"
            android:backgroundTint="#2563EB"
            android:textColor="#FFFFFF"
            android:paddingHorizontal="24dp"
            android:layout_marginEnd="12dp" />

        <Button
            android:id="@+id/btnResetGame"
            android:layout_width="wrap_content"
            android:layout_height="56dp"
            android:text="रीसेट"
            android:backgroundTint="#475569"
            android:textColor="#FFFFFF" />
    </LinearLayout>

</LinearLayout>
`,
  },
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.ludogame">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Ludo Game"
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
`,
  },
  {
    name: 'build.gradle.kts (App)',
    path: 'app/build.gradle.kts',
    language: 'gradle',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.example.ludogame"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.ludogame"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
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
`,
  },
  {
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    content: `# 🎲 Ludo Game Android Studio Project (Kotlin + XML)

यह प्रोजेक्ट Android Studio के लिए एक क्लासिक 4-Player लूडो बोर्ड गेम है, जिसे Kotlin और Native XML Views के साथ विकसित किया गया है।

## 🚀 फीचर्स (Features)
- **4-प्लेयर सपोर्ट**: लाल (Red), हरा (Green), पीला (Yellow), नीला (Blue)
- **कस्टम बोर्ड कैनवास (Custom Canvas View)**: \`LudoBoardView.kt\` द्वारा 15x15 ग्रिड और स्मूथ टोकन रेंडरिंग
- **पासा सिस्टम (Dice System)**: 1 से 6 तक रैंडम रोलिंग एनीमेशन
- **नियम कार्यान्वयन**:
  - 6 आने पर टोकन यार्ड से बाहर आता है।
  - गोटी काटने (Capture) पर प्रतिद्वंदी का टोकन वापस यार्ड में जाता है और अतिरिक्त रोल मिलता है।
  - 8 सुरक्षित स्थान (Safe Spots / Stars)।
  - सेंटर होम में सटीक (Exact) रोल से जीतना।
- **विजेता अलर्ट**: खेल समाप्त होने पर पॉपअप और नया खेल शुरू करने का विकल्प।

## 📲 APK (.apk) बनाने का आसान तरीका:
1. इस प्रोजेक्ट को अनजिप करें।
2. Android Studio खोलें -> **Open** -> अनजिप किया हुआ फोल्डर चुनें।
3. Gradle Sync पूरा होने दें।
4. ऊपर मेनू में जाएं: **Build -> Build Bundle(s) / APK(s) -> Build APK(s)** पर क्लिक करें।
5. नोटिफिकेशन में **locate** पर क्लिक करें या \`app/build/outputs/apk/debug/app-debug.apk\` से APK प्राप्त करें!
6. APK को अपने Android फोन में भेजें और इंस्टॉल करें!
`,
  },
  {
    name: 'HOW_TO_CREATE_APK.txt',
    path: 'HOW_TO_CREATE_APK.txt',
    language: 'markdown',
    content: `========================================================================
🎲 LUDO GAME - APK बनाने का संपूर्ण तरीका (HOW TO BUILD APK)
========================================================================

नमस्ते! यह Ludo Game (Kotlin + XML) का तैयार Android Studio प्रोजेक्ट है।
इस प्रोजेक्ट से अपने फोन के लिए APK (.apk फाइल) बनाने का पूरा तरीका:

------------------------------------------------------------------------
📌 चरण 1: प्रोजेक्ट को अनजिप करें (Extract Project)
------------------------------------------------------------------------
1. डाउनलोड की गई ZIP फाइल पर Right Click करें।
2. 'Extract All' (सभी निकालें) चुनें।
3. फोल्डर जैसे: C:\\AndroidProjects\\LudoGame

------------------------------------------------------------------------
📌 चरण 2: Android Studio में प्रोजेक्ट खोलें (Open in Android Studio)
------------------------------------------------------------------------
1. Android Studio खोलें (https://developer.android.com/studio)
2. 'Open' बटन पर क्लिक करें।
3. अनजिप किया गया 'LudoGame' फोल्डर चुनें।
4. पहली बार नीचे 'Gradle Sync' होगा। "BUILD SUCCESSFUL" आने तक इंतज़ार करें।

------------------------------------------------------------------------
📌 चरण 3: APK जनरेट करें (3 तरीके)
------------------------------------------------------------------------
🎯 तरीका A (सबसे आसान - Android Studio Menu से):
1. ऊपर मेन्यू में जाएं:
   Build  ->  Build Bundle(s) / APK(s)  ->  Build APK(s)
2. कुछ ही सेकंड में नीचे दाईं ओर पॉपअप आएगा:
   "Build APK(s): APK(s) generated successfully"
3. उस पॉपअप में नीले रंग के 'locate' लिंक पर क्लिक करें।
4. आपकी 'app-debug.apk' फाइल सीधे आपके सामने होगी!

🎯 तरीका B (Terminal / Command Line से):
1. Android Studio के नीचे 'Terminal' टैब खोलें।
2. Windows पर टाइप करें: gradlew.bat assembleDebug
   (Mac/Linux पर: ./gradlew assembleDebug)
3. Enter दबाएं। BUILD SUCCESSFUL आते ही APK तैयार हो जाएगा!

🎯 तरीका C (Signed Release APK - दोस्तों को भेजने या Play Store के लिए):
1. Build -> Generate Signed Bundle / APK...
2. 'APK' चुनें और Next दबाएं।
3. 'Create new...' करके अपना Keystore बनाएं और Password डालें।
4. 'release' वैरिएंट चुनें और Create पर क्लिक करें।

------------------------------------------------------------------------
📌 चरण 4: APK फाइल का स्थान (Where to Find Your APK)
------------------------------------------------------------------------
प्रोजेक्ट फोल्डर में इस जगह APK फाइल मिलेगी:
app/build/outputs/apk/debug/app-debug.apk

------------------------------------------------------------------------
📌 चरण 5: अपने मोबाइल में कैसे इनस्टॉल करें (Install on Mobile)
------------------------------------------------------------------------
1. 'app-debug.apk' फाइल को WhatsApp, Google Drive या USB Cable से फोन में भेजें।
2. फोन में फाइल पर टैप करें।
3. अगर 'Unknown Sources' की परमिशन मांगे तो Settings में जाकर 'Allow' चालू करें।
4. 'Install' बटन दबाएं और लूडो गेम खेलें!
========================================================================`,
  },
];
