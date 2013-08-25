# -*- coding: utf-8 -*-
from django.shortcuts import render_to_response, render
from django.shortcuts import redirect
from django.http import HttpResponseRedirect

from django.template import Context, RequestContext
from django.views.generic.edit import CreateView
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

from .models import UserProfile, Post
from .forms import UserRegisterForm, PostForm, PostWriteForm
from django.utils import timezone
from django.core.mail import send_mail
import hashlib

class WritePost(CreateView):
    model = PostForm
    form_class = PostWriteForm
    success_url = '/'
    template_name = 'index.html'

    def form_valid(self, form):
        user = self.request.user.id
        instance = form.save(commit=False)
        instance.created = timezone.now()
        instance.user_key = UserProfile.objects.get(user_id=user)
        return super(WritePost, self).form_valid(form)

#class UpdatePost(UpdateView):