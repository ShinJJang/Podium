# -*- coding: utf-8 -*-
from django.shortcuts import redirect, render
from django.views.generic.edit import CreateView
from django.contrib.auth.decorators import login_required

from .models import UserProfile, Post, Comment
from .forms import PostForm, PostWriteForm
from django.utils import timezone

@login_required()
def home(request):
    return render(request, 'index.html')