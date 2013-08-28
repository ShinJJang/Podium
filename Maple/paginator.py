import json

from django.db import connection

from tastypie.paginator import Paginator


class EstimatedCountPaginator(Paginator):

    def get_next(self, limit, offset, count):
        # The parent method needs an int which is higher than "limit + offset"
        # to return a url. Setting it to an unreasonably large value, so that
        # the parent method will always return the url.
        count = 2 ** 64
        return super(EstimatedCountPaginator, self).get_next(limit, offset, count)

    def get_count(self):
        return None

    def get_estimated_count(self):
        """Get the estimated count by using the database query planner."""
        # If you do not have PostgreSQL as your DB backend, alter this method
        # accordingly.
        return self._get_postgres_estimated_count()

    def _get_postgres_estimated_count(self):

        # This method only works with postgres >= 9.0.
        # If you need postgres vesrions less than 9.0, remove "(format json)"
        # below and parse the text explain output.

        def _get_postgres_version():
            # Due to django connections being lazy, we need a cursor to make
            # sure the connection.connection attribute is not None.
            connection.cursor()
            return connection.connection.server_version

        try:
            if _get_postgres_version() < 90000:
                return
        except AttributeError:
            return

        cursor = connection.cursor()
        query = self.objects.all().query

        # Remove limit and offset from the query, and extract sql and params.
        query.low_mark = None
        query.high_mark = None
        query, params = self.objects.query.sql_with_params()

        # Fetch the estimated rowcount from EXPLAIN json output.
        query = 'explain (format json) %s' % query
        cursor.execute(query, params)
        explain = cursor.fetchone()[0]
        # Older psycopg2 versions do not convert json automatically.
        if isinstance(explain, basestring):
            explain = json.loads(explain)
        rows = explain[0]['Plan']['Plan Rows']
        return rows

    def page(self):
        data = super(EstimatedCountPaginator, self).page()
        data['meta']['estimated_count'] = self.get_estimated_count()
        return data