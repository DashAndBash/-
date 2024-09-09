import win32gui, win32com.client
import win32con,win32api
import time


class Toogler:
    def __init__(self,hwnd):
        self.IsMaximized =False
        self.Bit = 0
        self.hwnd = hwnd
        self.ToggleKey = None
    def __getitem__(self,index):
        return (self.Bit & (1 << index)) > 0  # 비트를 확인
    def WinCtrl(self):
        if self.IsMaximized:
            self.WinMinimize()
            self.IsMaximized = False
        else:
            self.WinMaximize()
            self.IsMaximized = True
    def WinMinimize(self):
        if self[4]:
            win32gui.ShowWindow(self.hwnd, win32con.SW_MINIMIZE)
            return
        win32gui.ShowWindow(self.hwnd, win32con.SW_RESTORE)
        if self[0]:
            win32gui.SetWindowPos(self.hwnd, win32con.HWND_NOTOPMOST, 0, 0, 0, 0,
                          win32con.SWP_NOMOVE | win32con.SWP_NOSIZE)#고정 풀기
        elif self[2] or self[3]:
            alpha = 191 - 127 * self[3]
            self.SetAlpha(alpha)
    def WinMaximize(self):
        win32gui.ShowWindow(self.hwnd, 9)
        shell = win32com.client.Dispatch("WScript.Shell")
        shell.SendKeys('%')
        win32gui.SetForegroundWindow(self.hwnd)
        win32gui.ShowWindow(self.hwnd, win32con.SW_SHOW)
        win32gui.ShowWindow(self.hwnd, win32con.SW_MAXIMIZE)
        if self[0] or self[1]:
            win32gui.SetWindowPos(self.hwnd, win32con.HWND_BOTTOM, 0, 0, 0, 0,
                          win32con.SWP_NOMOVE | win32con.SWP_NOSIZE)#창 고정
        if self[2] or self[3]:
            self.SetAlpha(255)
    def SetAlpha(self,Alpha):
        win32gui.SetWindowLong(self.hwnd, win32con.GWL_EXSTYLE, 
                win32gui.GetWindowLong(self.hwnd, win32con.GWL_EXSTYLE) | win32con.WS_EX_LAYERED)
        win32gui.SetLayeredWindowAttributes(self.hwnd, win32api.RGB(0, 0, 0), Alpha, win32con.LWA_ALPHA)
def GetChildHandle(handle):
    ChildArray = []
    win32gui.EnumChildWindows(handle, ChildCallBack, ChildArray)
    if ChildArray:
        print(f"Handle Count:{len(ChildArray)}")
    else:
        print("No WorkerW handles found under Progman")

def ChildCallBack(hwnd,extra):
    window_class = win32gui.GetClassName(hwnd)
    window_title = win32gui.GetWindowText(hwnd)
    print(f"Found child window: Handle = {hwnd}, Class = {window_class}, Title = {window_title}")
    extra.append(hwnd)
    return True
# 특정 소유자(owner) 창의 소유된 창들을 구하는 함수
def get_owned_windows(owner_hwnd):
    owned_windows = []
    
    # 첫 번째 소유된 창을 가져옴
    hwnd = win32gui.GetWindow(owner_hwnd, win32con.GW_HWNDFIRST)
    print(hwnd)
    while hwnd:
        # 창이 owner_hwnd에 의해 소유된 창인지 확인
        if win32gui.GetWindow(hwnd, win32con.GW_OWNER) == owner_hwnd:
            owned_windows.append(hwnd)
        else:
            print("찾았는데 아ㄴ;ㅁ")
        # 다음 창으로 이동
        hwnd = win32gui.GetWindow(hwnd, win32con.GW_HWNDNEXT)
    
    return owned_windows


def window_enumeration_handler(hwnd, top_windows):
    top_windows.append((hwnd, win32gui.GetWindowText(hwnd)))

top_windows = []
def getWindowHandle():
    win32gui.EnumWindows(window_enumeration_handler, top_windows)



getWindowHandle()
number = 0
AvailableWindows=[]
for i in top_windows:
    if(1):
        number +=1
        print("<"+str(number)+">", "name:",i[1])
        AvailableWindows.append(i)
del top_windows
print("\n컨트롤 할 창의 번호를 설정하세요.\n현재 사용가능한 창의 갯수:",number)
ControlNunmber = ""
while True:
    ControlNunmber = input()
    if (not ControlNunmber.isdigit()):
        print("입력 오류: 숫자를 입력해 주세요.")
    #elif(int(ControlNunmber) > len(AvailableWindows)):
    #    print("입력 오류: 최대",str(number),"까지 입력 가능합니다.")
    else:
        break
ControlNunmber = int(ControlNunmber)
#print("현재",AvailableWindows[ControlNunmber][1],"를 조작하고 있습니다.\n핸들 넘버:",AvailableWindows[ControlNunmber][0])
ControlHWND = ControlNunmber
toggler = Toogler(ControlHWND)
print(toggler.hwnd)
parent_hwnd = win32gui.GetParent(toggler.hwnd)
Owner_hwnd = win32gui.GetWindow(toggler.hwnd, win32con.GW_OWNER)
if parent_hwnd:
    print(f"Parent handle of {toggler.hwnd} is {parent_hwnd}")
    print("owner is",Owner_hwnd)
else:
    print(f"Window {toggler.hwnd} has no parent")

print("레이어 상태",win32gui.GetWindowLong(toggler.hwnd, win32con.GWL_EXSTYLE))