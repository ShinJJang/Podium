# -*- coding: utf-8 -*-
from django.shortcuts import render_to_response, render
from django.shortcuts import redirect

from django.template import Context, RequestContext
from django.views.generic.edit import CreateView

from .models import Post
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
        instance = form.save(commit=False)
        instance.created = timezone.now()
        return super(WritePost, self).form_valid(form)

#class UpdatePost(UpdateView):