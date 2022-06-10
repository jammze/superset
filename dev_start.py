import os

from superset import create_app

os.environ["superset_dev"] = os.path.join(os.getcwd(), 'superset_dev/Scripts')

if __name__ == '__main__':
    superset_app = create_app()

    superset_app.run(host="localhost", port="4000", debug=True)
