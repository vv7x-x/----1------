using System;
using System.Diagnostics;
using System.IO;

class Program
{
    static void Main(string[] args)
    {
        string processName = "اسم_البرنامج"; // بدون .exe
        string installPath = @"C:\Program Files\اسم_البرنامج";

        // قتل العملية لو شغالة
        foreach (var process in Process.GetProcessesByName(processName))
        {
            process.Kill();
            process.WaitForExit();
            Console.WriteLine($"Process {processName} killed.");
        }

        // حذف مجلد التثبيت
        if (Directory.Exists(installPath))
        {
            Directory.Delete(installPath, true);
            Console.WriteLine("Installation folder deleted.");
        }
        else
        {
            Console.WriteLine("Installation folder not found.");
        }
    }
}
