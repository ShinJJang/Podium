from django import forms
from django.db import models

from .models import Post

# do not use resgistration.views!
from registration.backends.default.views import RegistrationView
from registration.forms import RegistrationFormUniqueEmail

class RegistrationForm(RegistrationFormUniqueEmail):
    def clean_username(self):
        return self.cleaned_data['username']

class RegistrationViewUniqueEmail(RegistrationView):
    form_class = RegistrationForm

class PostForm(models.Model):
    post = forms.Textarea

    # On Python 3: def __str__(self):
    def __unicode__(self):
        return self.name

class PostWriteForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['post']