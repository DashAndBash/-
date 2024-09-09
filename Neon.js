const Neon = document.querySelector("#NeonClock");
const EmptyButton = document.querySelector("#EmptyButton");
const neonCtx = Neon.getContext("2d", { willReadFrequently: true });
Neon.width = 916;
Neon.height = 200;
class Drawer {
    constructor(Inch, segLen, padding, space, context) {
        this.Inch = Inch;
        this.segLen = segLen;
        this.padding = padding;
        this.space = space;
        this.currentNumber = 100;
        this.segmentElement = 0;
        this.NeonCtx = context;
    }
    BuildEnvironment(line, fillStyle, strokeStyle) {
        this.NeonCtx.lineWidth = line;
        this.NeonCtx.fillStyle = fillStyle;
        this.NeonCtx.strokeStyle = strokeStyle;
    }
    PrepareToDraw(x, y) {
        this.NeonCtx.beginPath();
        this.NeonCtx.moveTo(x, y);
    }
    DrawHorizontalDigit(x, y) {
        this.PrepareToDraw(x, y);
        const Points = [
            { x: x + this.Inch, y: y + this.Inch },
            { x: x + this.Inch * (this.segLen - 1), y: y + this.Inch },
            { x: x + this.Inch * this.segLen, y: y },
            { x: x + this.Inch * (this.segLen - 1), y: y - this.Inch },
            { x: x + this.Inch, y: y - this.Inch },
            { x: x, y: y },
        ];
        Points.forEach(point => {
            this.NeonCtx.lineTo(point.x, point.y);
        });
        this.fillOrStroke();
    }
    DrawVerticalDigit(x, y) {
        this.PrepareToDraw(x, y);
        const Points = [
            { x: x + this.Inch, y: y + this.Inch },
            { x: x + this.Inch, y: y + this.Inch * (this.segLen - 1) },
            { x: x, y: y + this.Inch * this.segLen },
            { x: x - this.Inch, y: y + this.Inch * (this.segLen - 1) },
            { x: x - this.Inch, y: y + this.Inch },
            { x: x, y: y },
        ];
        Points.forEach(point => {
            this.NeonCtx.lineTo(point.x, point.y);
        });
        this.fillOrStroke();
    }
    SetNumber(Seg7Number) {
        this.currentNumber = Seg7Number;
    }
    /**
     * 마지막 텍스트의 끝자락 x좌표를 구합니다.
     * 해당 위치를 defaultx로 지정하면 정확하게 다음 숫자로 넘어갈수 있을겁니다.
     * @returns 적당한 x좌표.
     */
    GetProperXpos() {
        const x = this.Inch * this.segLen + this.space * 2 + this.padding;
        return x;
    }
    /**
     * 7디지털의 번호. 0은 최상단,1은 좌측상단,2는 우측상단,3은 중앙,4는 좌측하단,5는 우측하단,6은 최하단
     */
    fillOrStroke() {
        const Boolean = this.currentNumber & (64 >> this.segmentElement);
        if (Boolean !== 0) {
            this.NeonCtx.stroke();
            this.NeonCtx.fill();
        }
        else {
            this.NeonCtx.stroke();
        }
        this.segmentElement += 1;
    }
    //**Y좌표 보정이 자동임. X축은 맞춰줘야함.*/
    DrawColonSequence(x, y) {
        this.PrepareToDraw(x, y);
        x += this.Inch * 5.3;
        [Math.floor(this.Inch * this.segLen * 0.5),
            this.Inch * this.segLen * 1.0]
            .forEach(element => {
            y += element;
            this.NeonCtx.moveTo(x, y);
            this.DrawColon(x, y);
        });
        if (IsColonShines) {
            this.NeonCtx.fill();
        }
        this.NeonCtx.stroke();
    }
    DrawColon(x, y) {
        const Points = [
            { x: x + this.Inch, y: y + this.Inch },
            { x: x + this.Inch * 2, y: y },
            { x: x + this.Inch, y: y - this.Inch },
            { x: x, y: y }
        ];
        Points.forEach(point => {
            this.NeonCtx.lineTo(point.x, point.y);
        });
    }
}
class Seg7NeonDisplay {
    constructor(DrawTool) {
        this.Default = { x: 0, y: 0 };
        this.DrawTool = DrawTool;
    }
    AdjustDefaultPosition(Vector2) {
        this.Default = Vector2;
    }
    CreateNumber(number) {
        const segments = [
            119, // 0 -> 01110111
            18, // 1 -> 00010010
            93, // 2 -> 01011101
            91, // 3 -> 01011011
            58, // 4 -> 00111010
            107, // 5 -> 01101011
            111, // 6 -> 01101111
            114, // 7 -> 01110010
            127, // 8 -> 01111111
            123 // 9 -> 01111011
        ];
        const SegMap = segments[number];
        this.DrawTool.SetNumber(SegMap);
        this.DrawTool.segmentElement = 0;
        const InchSegLen = this.DrawTool.Inch * this.DrawTool.segLen;
        for (let i = 0; i < 2; i++) {
            this.DrawTool.DrawHorizontalDigit(this.Default.x + this.DrawTool.padding + this.DrawTool.space, this.Default.y + this.DrawTool.padding + i * (InchSegLen + this.DrawTool.space * 2));
            this.DrawTool.DrawVerticalDigit(this.Default.x + this.DrawTool.padding, this.Default.y + this.DrawTool.padding + this.DrawTool.space + i * (InchSegLen + this.DrawTool.space * 2));
            this.DrawTool.DrawVerticalDigit(this.Default.x + this.DrawTool.padding + InchSegLen + this.DrawTool.space * 2, this.Default.y + this.DrawTool.padding + this.DrawTool.space + i * (InchSegLen + this.DrawTool.space * 2));
        }
        this.DrawTool.DrawHorizontalDigit(this.Default.x + this.DrawTool.padding + this.DrawTool.space, this.Default.y + this.DrawTool.padding + this.DrawTool.space * 4 + InchSegLen * 2);
    }
    CreateColon() {
        this.DrawTool.DrawColonSequence(this.Default.x, this.Default.y + this.DrawTool.padding + this.DrawTool.space);
    }
}
class GlitchEffecter {
    constructor() {
        this.BlueNeon = document.querySelector("#NeonClock2");
        this.RedNeon = document.querySelector("#NeonClock3");
        this.Bluectx = this.BlueNeon.getContext("2d", { willReadFrequently: true });
        this.Redctx = this.RedNeon.getContext("2d", { willReadFrequently: true });
        this.BlueNeon.width = 916;
        this.RedNeon.width = 916;
        this.BlueNeon.height = 200;
        this.RedNeon.height = 200;
        this.AnimationLength = 40;
        this.RenderBox = [];
    }
    BuildClone(CloneNeonCtx, fillcolor, strokecolor, Text) {
        CloneNeonCtx.clearRect(0, 0, 916, 200);
        const DrawTool = new Drawer(10, 7, 25, 2, CloneNeonCtx);
        const Seg7Display = new Seg7NeonDisplay(DrawTool);
        const posX = DrawTool.GetProperXpos();
        DrawTool.BuildEnvironment(1, fillcolor, strokecolor);
        Seg7Display.AdjustDefaultPosition({ x: posX * 2, y: 0 });
        Seg7Display.CreateNumber(Text[0]);
        Seg7Display.AdjustDefaultPosition({ x: posX * 3, y: 0 });
        Seg7Display.CreateNumber(Text[1]);
        Seg7Display.AdjustDefaultPosition({ x: posX * 4, y: 0 });
        Seg7Display.CreateColon();
        Seg7Display.AdjustDefaultPosition({ x: posX * 5, y: 0 });
        Seg7Display.CreateNumber(Text[3]);
        Seg7Display.AdjustDefaultPosition({ x: posX * 6, y: 0 });
        Seg7Display.CreateNumber(Text[4]);
    }
    /**
     * 그림을 나누는, 지질학의 판의 개념입니다.
     * 이 판을 어떻게 나눌 것인지를 판단합니다.
     * 참고로 10과 190을 반드시 추가하여, 배열의 시작은 10, 끝은 190입니다.
     * @param minBoxes 최소판의 갯수입니다. 최소배열은 min+2입니다.
     * @param MaxBoxes 최대판의 갯수입니다. 최대배열은 max+1입니다.
    */
    BuildQueSequence(minBoxes, MaxBoxes) {
        for (let i = 0; i < this.AnimationLength; i++) {
            const array = [10];
            let lastValue = 10;
            const maxSize = 190;
            const Boxes = minBoxes + Math.floor(Math.random() * (MaxBoxes - minBoxes));
            for (let j = 0; j < Boxes; j++) {
                let range = (maxSize - lastValue) / (Boxes - j);
                let randomValue = lastValue + Math.floor(Math.random() * range);
                array.push(randomValue);
                lastValue = randomValue;
            }
            array.push(190);
            this.RenderBox.push(array);
        }
    }
    Glitch(sequence, Ctx) {
        const array = this.RenderBox[this.AnimationLength - sequence];
        if (array === undefined) {
            return;
        }
        for (let i = 0; i < array.length - 1; i++) {
            const Magnitude = this.AnimationLength * 8;
            const imageData = Ctx.getImageData(99 * 2, array[i], 99 * 7, array[i + 1]);
            Ctx.clearRect(100 * 2, array[i], 100 * 7, array[i + 1]);
            Ctx.putImageData(imageData, 99 * 2 + (Math.random() - 0.5) * Magnitude, array[i]);
        }
    }
    RemoveClone(CloneNeonCtx) {
        CloneNeonCtx.clearRect(0, 0, 916, 200);
    }
}
const startTime = Date.now();
function getAppUsageTime() {
    // 현재 시간과 시작 시간의 차이를 계산
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    // 밀리초 단위의 경과 시간을 시, 분으로 변환
    const totalMinutes = Math.floor(elapsedTime / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    // 두 자리 숫자로 포맷팅
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    // HH:MM 형식으로 반환
    return `${formattedHours}:${formattedMinutes}`;
}
function getCurrentTime() {
    const now = new Date();
    // 시각 (24시간 형식)
    let hours = now.getHours();
    hours = hours - (+(hours >= 13)) * 12 + 12 * (+(hours == 0));
    // 분
    const minutes = now.getMinutes();
    // 시각과 분을 두 자리 숫자로 맞춰서 출력
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
}
function TimeSet(Time) {
    neonCtx.clearRect(0, 0, 916, 200);
    const DrawTool = new Drawer(10, 7, 25, 2, neonCtx);
    const Seg7Display = new Seg7NeonDisplay(DrawTool);
    const posX = DrawTool.GetProperXpos();
    DrawTool.BuildEnvironment(1, WhiteColor, BlackColor);
    Seg7Display.AdjustDefaultPosition({ x: posX * 2, y: 0 });
    Seg7Display.CreateNumber(Time[0]);
    Seg7Display.AdjustDefaultPosition({ x: posX * 3, y: 0 });
    Seg7Display.CreateNumber(Time[1]);
    Seg7Display.AdjustDefaultPosition({ x: posX * 4, y: 0 });
    Seg7Display.CreateColon();
    Seg7Display.AdjustDefaultPosition({ x: posX * 5, y: 0 });
    Seg7Display.CreateNumber(Time[3]);
    Seg7Display.AdjustDefaultPosition({ x: posX * 6, y: 0 });
    Seg7Display.CreateNumber(Time[4]);
}
function MakeAGlitchEffect() {
    if (IsGlitching) {
        return;
    }
    IsGlitching = true;
    IsShowingUsingTime = !IsShowingUsingTime;
    let glitch = new GlitchEffecter();
    SetNeonTimer();
    glitch.BuildClone(glitch.Bluectx, BlueColor, BlackColor, Time);
    glitch.BuildClone(glitch.Redctx, RedColor, BlackColor, Time);
    glitch.BuildQueSequence(2, 4);
    function Glitch() {
        if (glitch.AnimationLength > 0) {
            // 움직임 로직 예시 (예: 왼쪽에서 오른쪽으로 이동)
            TimeSet(Time);
            glitch.BuildClone(glitch.Bluectx, BlueColor, BlackColor, Time);
            glitch.BuildClone(glitch.Redctx, RedColor, BlackColor, Time);
            glitch.Glitch(1, glitch.Redctx);
            glitch.Glitch(-1, glitch.Bluectx);
            glitch.Glitch(-3, neonCtx);
            glitch.AnimationLength -= 1;
            requestAnimationFrame(Glitch);
        }
        else {
            glitch.RemoveClone(glitch.Bluectx);
            glitch.RemoveClone(glitch.Redctx);
            SetNeonTimer();
            IsGlitching = false;
            glitch = null;
            return;
        }
    }
    Glitch();
}
function CheckGlitchForNeonTimer() {
    if (IsGlitching) {
        return;
    }
    SetNeonTimer();
}
function SetNeonTimer() {
    if (IsShowingUsingTime) {
        Time = getAppUsageTime();
    }
    else {
        Time = getCurrentTime();
    }
    IsColonShines = !IsColonShines;
    TimeSet(Time);
    return Time;
}
const RedColor = "#0000ff";
const BlueColor = "#ff0000";
const WhiteColor = "#ffffff";
const BlackColor = "#000000";
let IsColonShines = false;
let Time = getCurrentTime();
let IsGlitching = false;
let IsShowingUsingTime = false;
TimeSet(Time);
setInterval(CheckGlitchForNeonTimer, 1000);
EmptyButton.addEventListener("click", MakeAGlitchEffect);
