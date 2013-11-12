from setuptools import setup, find_packages

setup_requires = [
    ]

install_requires = [
    'Django==1.5.2',
    'ajaxuploader==0.3',
    'astroid==1.0.0',
    'coverage==3.6',
    'django-haystack==2.1.0',
    'django-jenkins==0.14.1',
    'django-jsonfield==0.9.10',
    'django-registration==1.0',
    'django-tastypie==0.10.0',
    'logilab-common==0.60.0',
    'psycopg2==2.5.1',
    'pyelasticsearch==0.6',
    'pylint==1.0.0',
    'python-dateutil==1.5',
    'raven==3.5.1',
    'requests==1.2.3',
    'simplejson==3.3.1',
    'six==1.4.1',
    'south==0.8.2',
    'boto==2.15.0',
    'django-debug-toolbar==0.11.0',
    'mimeparse==0.1.3'
    ]

dependency_links = [

    ]

setup(
    name='Podium-SNS',
    description='Podium-SNS(by SOMA)',
    author='Podium',
    author_email='lacidjun@gmail.com',
    packages=find_packages(),
    install_requires=install_requires,
    setup_requires=setup_requires,
    dependency_links=dependency_links,
    scripts=['manage.py'],
    entry_points={
        'console_scripts': [
            ],
        },
    )
