from django import forms
from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

from .models import Post

class UserRegisterForm(UserCreationForm):
    username = forms.CharField(label="Your Username")
    email = forms.EmailField(label="Email Address")
    class Meta:
        model = User
        fields = ('username', 'email',)

    def save(self, commit=True):
        user = super(UserRegisterForm, self).save(commit=False)
        user.username = self.cleaned_data["username"]
        user.email = self.cleaned_data["email"]
        user.is_active = False
        if commit:
            user.save()
        return  user

class PostForm(models.Model):
    post = forms.Textarea

    # On Python 3: def __str__(self):
    def __unicode__(self):
        return self.name

class PostWriteForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['post']