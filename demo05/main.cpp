#include <stdio.h>
#include <math.h>
#include <windows.h>
#include <iostream>

using namespace std;


int64_t Fib(int n)
{
    if (n == 0)
        return 0;
    else if (n == 1)
        return 1;
    else
        return Fib(n - 1) + Fib(n - 2);
}

int main()
{
    // for (int i = 0; i < 50; i++)
    // {
    //     cout << "Fib(" << i << ")"
    //          << "=" << Fib(i) << endl;
    // }
    int a, *p = &a;
    printf("%d\n", p + 5);
    system("pause");

    return 0;
}