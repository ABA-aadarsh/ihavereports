/*
#question(
    Write a program to take 3 integer input and print the sum of them.
    This is a multi-line question so i must be able to handle it as well.
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