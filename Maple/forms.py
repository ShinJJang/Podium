from django import forms
from django.db import models

from .models import Posts
from django.contrib.auth.models import User
# do not use resgistration.views!
from registration.backends.default.views import RegistrationView
from registration.forms import RegistrationForm
from django.utils.translation import ugettext_lazy as _

class RegistrationUniqueForm(RegistrationForm):

    def clean_email(self):
        if User.objects.filter(email__iexact=self.cleaned_data['email']):
            raise forms.ValidationError(_("This email address is already in use. Please supply a different email address."))
        return self.cleaned_data['email']

class RegistrationUniqueView(RegistrationView):
    form_class = RegistrationUniqueForm

class PostForm(models.Model):
    post = forms.Textarea

    # On Python 3: def __str__(self):
    def __unicode__(self):
        return self.name

class PostWriteForm(forms.ModelForm):
    class Meta:
        model = Posts
        fields = ['post']

from haystack.forms import SearchForm


class PostsSearchForm(SearchForm):

    def no_query_found(self):
        return self.searchqueryset.all()