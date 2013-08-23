# -*- coding: utf-8 -*-
from django.shortcuts import render_to_response, render
from django.shortcuts import redirect

from django.template import Context, RequestContext
from django.views.generic.edit import CreateView
from django.contrib.auth.models import User

from .models import UserProfile, Post
from .forms import PostForm, PostWriteForm
from django.utils import timezone

def home(request):
    return render_to_response('index.html', {'page_title': 'Podium'}, RequestContext(request))

class WritePost(CreateView):
    model = PostForm
    form_class = PostWriteForm
    success_url = '/'
    template_name = 'index.html'

    def form_valid(self, form):
        user = self.request.user
        instance = form.save(commit=False)
        instance.created = timezone.now()
        instance.user_key = UserProfile.objects.get(user=user)
        return super(WritePost, self).form_valid(form)

#class UpdatePost(UpdateView):