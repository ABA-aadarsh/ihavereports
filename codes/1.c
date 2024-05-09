#include<stdio.h>
int main(){
    int i=0,sum=0;int num[10];
    for( i=0;i<10;i++){
        printf("Enter num%d: ",i+1);
        scanf("%d",&num[i]);
    }
    for(i=0;i<10;i++){
        sum+=num[i];
    }
    printf("Sum is %d\n",sum);
}