' Noor Dental Clinic - silent launcher
' Double-click this (or the "Noor Dental Clinic" desktop icon) to start the app.
' No black cmd window stays open - the server runs quietly in the background.

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = scriptDir

If Not fso.FolderExists(scriptDir & "\node_modules") Then
  ' First time on this computer: run the normal visible setup so the user
  ' can see Node.js being detected and dependencies being installed.
  shell.Run """" & scriptDir & "\start.bat""", 1, False
Else
  ' Already installed: just start the server hidden (0 = no window) and
  ' leave it running quietly. Then open it as a clean app window (no
  ' address bar / tabs) - not a plain browser tab.
  shell.Run "cmd /c cd /d """ & scriptDir & """ && npm start", 0, False
  shell.Run "wscript //nologo """ & scriptDir & "\open-app-window.vbs"" 3", 0, False
End If
