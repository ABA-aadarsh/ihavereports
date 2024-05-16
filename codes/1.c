/*
#question(
    Write a program that takes 3 integers as input from user and displays the sum of them.
)
*/

#include<stdio.h>
int main(){
    int i=0,sum=0;int num[3];
    for( i=0;i<3;i++){
        printf("Enter num%d: ",i+1);
        scanf("%d",&num[i]);
    }
    for(i=0;i<3;i++){
        sum+=num[i];
    }
    printf("Sum is %d\n",sum);
}