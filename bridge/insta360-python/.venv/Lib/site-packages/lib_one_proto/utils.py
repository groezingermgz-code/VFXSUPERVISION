import os
import importlib


def get_all_proto_modules():
    """
    Get all the proto modules.
    """

    this_dir = os.path.dirname(os.path.abspath(__file__))
    proto_files = [
        f for f in os.listdir(this_dir) if f.endswith(".py") and f != "__init__.py"
    ]
    proto_modules = [
        importlib.import_module(f"lib_one_proto.{f[:-3]}") for f in proto_files
    ]
    return proto_modules
