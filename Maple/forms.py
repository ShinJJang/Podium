from django import forms
from django.db import models

from .models import Post

class PostForm(models.Model):
    user = forms.HiddenInput
    post = forms.Textarea
    # On Python 3: def __str__(self):
    def __unicode__(self):
		return self.name

class PostWriteForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['post']