' Opens the Noor Dental Clinic dashboard as a clean "app window" - no address
' bar, no tabs - the same look as an installed PWA. Uses Chrome or Edge's
' --app mode if either is installed; falls back to the normal default
' browser otherwise.
'
' Optional argument: seconds to wait first (gives the server time to start).

url = "http://127.0.0.1:3000"

If WScript.Arguments.Count > 0 Then
  WScript.Sleep CInt(WScript.Arguments(0)) * 1000
End If

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

candidates = Array( _
  shell.ExpandEnvironmentStrings("%ProgramFiles%") & "\Google\Chrome\Application\chrome.exe", _
  shell.ExpandEnvironmentStrings("%ProgramFiles(x86)%") & "\Google\Chrome\Application\chrome.exe", _
  shell.ExpandEnvironmentStrings("%LocalAppData%") & "\Google\Chrome\Application\chrome.exe", _
  shell.ExpandEnvironmentStrings("%ProgramFiles(x86)%") & "\Microsoft\Edge\Application\msedge.exe", _
  shell.ExpandEnvironmentStrings("%ProgramFiles%") & "\Microsoft\Edge\Application\msedge.exe" _
)

found = ""
For Each p In candidates
  If fso.FileExists(p) Then
    found = p
    Exit For
  End If
Next

If found <> "" Then
  shell.Run """" & found & """ --app=" & url & " --start-maximized --new-window", 1, False
Else
  shell.Run url
End If
