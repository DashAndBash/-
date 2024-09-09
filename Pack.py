import sys
import win32gui
import win32con,win32api


class WinBuilder():
    def __init__(self,handle):
        self.handle = handle
        self.WorkerW = None
        self.Progman = None
    def GetWindowHandle(self):
        progmanHandle = win32gui.FindWindow("Progman", None)
        self.Progman = progmanHandle
        progmanHandle = win32gui.FindWindow("Progman", None)
        workerwHandleArray = []
        win32gui.EnumChildWindows(progmanHandle, self.ChildCallBack, workerwHandleArray)
        if workerwHandleArray:
            print(f"Using WorkerW Handle: {self.WorkerW}")
        else:
            print("No WorkerW handles found under Progman")

    def SetParent(self,ParentHandle):
        win32gui.SetParent(self.handle,ParentHandle)
        win32gui.SetWindowPos(self.handle, win32con.HWND_BOTTOM, 0, 0, 0, 0,
                    win32con.SWP_NOMOVE | win32con.SWP_NOSIZE | win32con.SWP_NOACTIVATE)

    def GetWindowSize(hwnd):
        rect = win32gui.GetWindowRect(hwnd)
        width = rect[2] - rect[0]
        height = rect[3] - rect[1]
        return width, height
    def ChildCallBack(self,hwnd,extra):
        window_class = win32gui.GetClassName(hwnd)
        window_title = win32gui.GetWindowText(hwnd)
        print(f"Found child window: Handle = {hwnd}, Class = {window_class}, Title = {window_title}")
        if window_title == "FolderView":
            self.WorkerW = hwnd
        extra.append(hwnd)
    def SetLayerAndMakeTransparent(self):
        #524288 내 레이어
        #524448 달력의 레이어
        current_style = 524288 #524448
        new_style = current_style | win32con.WS_EX_LAYERED
        win32gui.SetWindowLong(self.handle, win32con.GWL_EXSTYLE, new_style)
        
# stdin에서 데이터를 읽기
for line in sys.stdin:
    # 받은 데이터를 처리 (여기서는 받은 데이터를 그대로 출력)
    input_data = line.strip()  # 받은 데이터를 줄바꿈 없이 처리
    print(f"Handle: {input_data}")
    handle =int(input_data)
    winBuilder = WinBuilder(handle)
    winBuilder.GetWindowHandle()
    print(winBuilder.handle,winBuilder.Progman,winBuilder.WorkerW)

    winBuilder.SetParent(winBuilder.WorkerW)
    winBuilder.SetLayerAndMakeTransparent()

